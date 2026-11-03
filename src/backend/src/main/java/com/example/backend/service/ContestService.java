package com.example.backend.service;

import com.example.backend.dto.ContestRequest;
import com.example.backend.dto.ContestResponse;
import com.example.backend.dto.PrizeDto;
import com.example.backend.entity.BaseDocument;
import com.example.backend.entity.Contest;
import com.example.backend.entity.ContestRegistration;
import com.example.backend.entity.JudgeAssignment;
import com.example.backend.entity.Submission;
import com.example.backend.entity.User;
import com.example.backend.entity.embedded.Award;
import com.example.backend.entity.embedded.JudgingCriterion;
import com.example.backend.entity.embedded.JudgingRound;
import com.example.backend.enums.ContestStatus;
import com.example.backend.enums.PrizeRank;
import com.example.backend.enums.Role;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ConflictException;
import com.example.backend.exception.ForbiddenOperationException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ContestRegistrationRepository;
import com.example.backend.repository.ContestRepository;
import com.example.backend.repository.EvaluationRepository;
import com.example.backend.repository.JudgeAssignmentRepository;
import com.example.backend.repository.SubmissionRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.AuthenticatedUser;
import com.example.backend.util.AppDates;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Vòng đời cuộc thi. Organizer chỉ thao tác trên cuộc thi của mình, Admin thao tác được mọi cuộc thi. */
@Service
public class ContestService {

    private static final String NOT_FOUND_MESSAGE = "Không tìm thấy cuộc thi";
    private static final double CRITERION_MAX_SCORE = 10;
    private static final double TOTAL_WEIGHT = 100;
    private static final List<String> DEFAULT_CRITERIA = List.of("Bố cục", "Ánh sáng", "Nội dung / Ý tưởng", "Kỹ thuật");

    private final ContestRepository contestRepository;
    private final SubmissionRepository submissionRepository;
    private final ContestRegistrationRepository registrationRepository;
    private final JudgeAssignmentRepository assignmentRepository;
    private final EvaluationRepository evaluationRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    public ContestService(
            ContestRepository contestRepository,
            SubmissionRepository submissionRepository,
            ContestRegistrationRepository registrationRepository,
            JudgeAssignmentRepository assignmentRepository,
            EvaluationRepository evaluationRepository,
            UserRepository userRepository,
            ActivityLogService activityLogService) {
        this.contestRepository = contestRepository;
        this.submissionRepository = submissionRepository;
        this.registrationRepository = registrationRepository;
        this.assignmentRepository = assignmentRepository;
        this.evaluationRepository = evaluationRepository;
        this.userRepository = userRepository;
        this.activityLogService = activityLogService;
    }

    /** Trang công khai và Participant: bỏ bản nháp, cuộc thi đã lưu trữ */
    public List<ContestResponse> getPublicContests() {
        return toResponses(contestRepository.findAll().stream()
                .filter(contest -> contest.getStatus() != ContestStatus.DRAFT && !contest.isArchived())
                .sorted(Comparator.comparing(BaseDocument::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList());
    }

    public List<ContestResponse> getManagedContests(AuthenticatedUser actor) {
        return toResponses(findManagedEntities(actor).stream()
                .sorted(Comparator.comparing(BaseDocument::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList());
    }

    public List<Contest> findManagedEntities(AuthenticatedUser actor) {
        return actor.role() == Role.ADMIN ? contestRepository.findAll() : contestRepository.findByOrganizerId(actor.id());
    }

    /** Bản nháp chỉ chủ cuộc thi và Admin xem được; người khác nhận 404 để không lộ */
    public ContestResponse getContest(String id, AuthenticatedUser actor) {
        Contest contest = requireContest(id);
        if (contest.getStatus() == ContestStatus.DRAFT && !canManage(contest, actor)) {
            throw new ResourceNotFoundException(NOT_FOUND_MESSAGE);
        }
        return toResponses(List.of(contest)).get(0);
    }

    public ContestResponse create(ContestRequest request, AuthenticatedUser actor) {
        validateDates(request);
        Contest contest = new Contest();
        contest.setOrganizerId(actor.id());
        contest.setSlug(uniqueSlug(request.title()));
        contest.setStatus(ContestStatus.UPCOMING);
        applyRequest(contest, request);
        contest.setRounds(List.of(defaultRound(contest)));
        Contest saved = contestRepository.save(contest);
        activityLogService.log(actor.id(), actor.role(), "CONTEST_CREATE", "CONTEST", saved.getId(), saved.getTitle());
        return toResponses(List.of(saved)).get(0);
    }

    public ContestResponse update(String id, ContestRequest request, AuthenticatedUser actor) {
        Contest contest = requireManaged(id, actor);
        validateDates(request);
        if (contest.getStatus() == ContestStatus.ENDED && !isSameSchedule(contest, request)) {
            throw new ConflictException("Cuộc thi đã kết thúc, không thể đổi các mốc thời gian");
        }
        applyRequest(contest, request);
        syncRoundDates(contest);
        Contest saved = contestRepository.save(contest);
        activityLogService.log(actor.id(), actor.role(), "CONTEST_UPDATE", "CONTEST", saved.getId(), saved.getTitle());
        return toResponses(List.of(saved)).get(0);
    }

    /** Kết thúc thủ công (khóa nhận bài). Chỉ cho đặt các trạng thái mà giao diện dùng */
    public ContestResponse updateStatus(String id, ContestStatus status, AuthenticatedUser actor) {
        Contest contest = requireManaged(id, actor);
        contest.setStatus(status);
        if (status == ContestStatus.ENDED) {
            contest.setSubmissionOpen(false);
            contest.setPaused(false);
        }
        Contest saved = contestRepository.save(contest);
        activityLogService.log(actor.id(), actor.role(), "CONTEST_STATUS", "CONTEST", saved.getId(), status.name());
        return toResponses(List.of(saved)).get(0);
    }

    public ContestResponse setArchived(String id, boolean archived, AuthenticatedUser actor) {
        Contest contest = requireManaged(id, actor);
        contest.setArchived(archived);
        Contest saved = contestRepository.save(contest);
        activityLogService.log(actor.id(), actor.role(), archived ? "CONTEST_ARCHIVE" : "CONTEST_RESTORE",
                "CONTEST", saved.getId(), saved.getTitle());
        return toResponses(List.of(saved)).get(0);
    }

    public ContestResponse duplicate(String id, AuthenticatedUser actor) {
        Contest source = requireManaged(id, actor);
        Contest copy = new Contest();
        copy.setOrganizerId(actor.id());
        copy.setTitle(source.getTitle() + " (Bản sao)");
        copy.setSlug(uniqueSlug(copy.getTitle()));
        copy.setDescription(source.getDescription());
        copy.setTheme(source.getTheme());
        copy.setCoverUrl(source.getCoverUrl());
        copy.setCategories(new ArrayList<>(source.getCategories()));
        copy.setCriteria(new ArrayList<>(source.getCriteria()));
        copy.setAwards(new ArrayList<>(source.getAwards()));
        copy.setRegulations(source.getRegulations());
        copy.setMaxPhotosPerParticipant(source.getMaxPhotosPerParticipant());
        copy.setAnonymousJudging(source.isAnonymousJudging());
        copy.setStatus(ContestStatus.DRAFT);
        copy.setRounds(List.of(defaultRound(copy)));
        Contest saved = contestRepository.save(copy);
        activityLogService.log(actor.id(), actor.role(), "CONTEST_DUPLICATE", "CONTEST", saved.getId(), source.getId());
        return toResponses(List.of(saved)).get(0);
    }

    /** Đã có bài dự thi thì giữ lại lịch sử: yêu cầu lưu trữ thay vì xóa */
    public void delete(String id, AuthenticatedUser actor) {
        Contest contest = requireManaged(id, actor);
        if (submissionRepository.countByContestId(id) > 0) {
            throw new ConflictException("Cuộc thi đã có bài dự thi, hãy lưu trữ thay vì xóa");
        }
        registrationRepository.deleteByContestId(id);
        assignmentRepository.deleteByContestId(id);
        contestRepository.delete(contest);
        activityLogService.log(actor.id(), actor.role(), "CONTEST_DELETE", "CONTEST", id, contest.getTitle());
    }

    public Contest requireContest(String id) {
        return contestRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MESSAGE));
    }

    public Contest requireManaged(String id, AuthenticatedUser actor) {
        Contest contest = requireContest(id);
        if (!canManage(contest, actor)) {
            throw new ForbiddenOperationException("Bạn không quản lý cuộc thi này");
        }
        return contest;
    }

    public static boolean canManage(Contest contest, AuthenticatedUser actor) {
        if (actor == null) {
            return false;
        }
        return actor.role() == Role.ADMIN || actor.id().equals(contest.getOrganizerId());
    }

    /** Giai đoạn thực tế theo mốc thời gian. ENDED / DRAFT do người quản lý chốt nên không tự đổi. */
    public static ContestStatus effectiveStatus(Contest contest, Instant now) {
        ContestStatus stored = contest.getStatus();
        if (stored == ContestStatus.ENDED || stored == ContestStatus.DRAFT
                || contest.getSubmissionStart() == null || contest.getSubmissionEnd() == null) {
            return stored;
        }
        if (now.isBefore(contest.getSubmissionStart())) {
            return ContestStatus.UPCOMING;
        }
        return now.isAfter(contest.getSubmissionEnd()) ? ContestStatus.JUDGING : ContestStatus.ONGOING;
    }

    public static boolean isAcceptingSubmissions(Contest contest, Instant now) {
        return effectiveStatus(contest, now) == ContestStatus.ONGOING
                && contest.isSubmissionOpen() && !contest.isPaused() && !contest.isArchived();
    }

    public List<ContestResponse> toResponses(List<Contest> contests) {
        Instant now = Instant.now();
        Set<String> userIds = new HashSet<>();
        for (Contest contest : contests) {
            userIds.add(contest.getOrganizerId());
            userIds.addAll(contest.getJudgeIds());
        }
        Map<String, List<JudgeAssignment>> assignments = contests.stream().collect(Collectors.toMap(
                BaseDocument::getId, contest -> assignmentRepository.findByContestId(contest.getId())));
        assignments.values().forEach(list -> list.forEach(item -> userIds.add(item.getJudgeId())));
        userIds.remove(null);
        Map<String, String> names = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(BaseDocument::getId, User::getName));

        return contests.stream().map(contest -> {
            String id = contest.getId();
            Set<String> participants = registrationRepository.findByContestId(id).stream()
                    .map(ContestRegistration::getParticipantId).collect(Collectors.toCollection(HashSet::new));
            List<Submission> submissions = submissionRepository.findByContestId(id);
            submissions.forEach(item -> participants.add(item.getParticipantId()));

            Set<String> judgeIds = new LinkedHashSet<>(contest.getJudgeIds());
            assignments.get(id).forEach(item -> judgeIds.add(item.getJudgeId()));
            List<String> judgeNames = judgeIds.stream().map(names::get).filter(name -> name != null).toList();

            return new ContestResponse(
                    id,
                    contest.getTitle(),
                    contest.getSlug(),
                    contest.getDescription(),
                    contest.getTheme(),
                    contest.getCoverUrl(),
                    contest.getCategories(),
                    effectiveStatus(contest, now),
                    contest.isArchived(),
                    contest.isSubmissionOpen(),
                    contest.isPaused(),
                    isAcceptingSubmissions(contest, now),
                    contest.getResultPublishedAt() != null,
                    AppDates.toDate(contest.getSubmissionStart()),
                    AppDates.toDate(contest.getSubmissionEnd()),
                    AppDates.toDate(contest.getJudgingStart()),
                    AppDates.toDate(contest.getJudgingEnd()),
                    AppDates.toDate(Optional.ofNullable(contest.getResultPublishedAt()).orElse(contest.getPlannedResultDate())),
                    contest.getMaxPhotosPerParticipant(),
                    contest.isAnonymousJudging(),
                    contest.getCriteria(),
                    contest.getAwards().stream().map(award -> new PrizeDto(award.title(), award.reward())).toList(),
                    contest.getRegulations(),
                    contest.getOrganizerId(),
                    names.get(contest.getOrganizerId()),
                    new ArrayList<>(judgeIds),
                    contest.getDefaultJudgeIds(),
                    judgeNames,
                    participants.size(),
                    submissions.size());
        }).toList();
    }

    private void applyRequest(Contest contest, ContestRequest request) {
        contest.setTitle(request.title().trim());
        contest.setDescription(request.description());
        contest.setTheme(request.theme());
        if (request.coverUrl() != null) {
            contest.setCoverUrl(request.coverUrl());
        }
        if (request.categories() != null) {
            contest.setCategories(request.categories());
        }
        if (request.criteria() != null || contest.getCriteria().isEmpty()) {
            contest.setCriteria(resolveCriteria(contest, request.criteria()));
        }
        if (request.maxPhotosPerParticipant() != null) {
            if (request.maxPhotosPerParticipant() < 1) {
                throw new BadRequestException("Số ảnh tối đa mỗi thí sinh phải từ 1 trở lên");
            }
            contest.setMaxPhotosPerParticipant(request.maxPhotosPerParticipant());
        }
        contest.setRegulations(request.regulations());
        contest.setSubmissionStart(AppDates.startOfDay(request.submissionStart()));
        contest.setSubmissionEnd(AppDates.endOfDay(request.submissionEnd()));
        contest.setJudgingStart(AppDates.startOfDay(request.judgingStart()));
        contest.setJudgingEnd(AppDates.endOfDay(request.judgingEnd()));
        contest.setPlannedResultDate(AppDates.startOfDay(request.resultDate()));
        if (request.prizes() != null) {
            contest.setAwards(toAwards(request.prizes()));
        }
        if (request.judgeIds() != null) {
            contest.setJudgeIds(validJudgeIds(request.judgeIds()));
        }
        if (request.defaultJudgeIds() != null) {
            contest.setDefaultJudgeIds(request.defaultJudgeIds());
        }
        if (request.anonymousJudging() != null) {
            contest.setAnonymousJudging(request.anonymousJudging());
        }
        if (request.submissionOpen() != null) {
            contest.setSubmissionOpen(request.submissionOpen());
        }
        if (request.paused() != null) {
            contest.setPaused(request.paused());
        }
    }

    /** Giữ id tiêu chí trùng tên để phiếu đã chấm còn hợp lệ; đã có phiếu chấm thì không cho đổi bộ tiêu chí */
    private List<JudgingCriterion> resolveCriteria(Contest contest, List<String> requested) {
        List<String> names = requested == null || requested.isEmpty() ? DEFAULT_CRITERIA : requested.stream()
                .map(String::trim).filter(name -> !name.isEmpty()).distinct().toList();
        if (names.isEmpty()) {
            throw new BadRequestException("Cần ít nhất 1 tiêu chí chấm");
        }
        List<String> currentNames = contest.getCriteria().stream().map(JudgingCriterion::name).toList();
        if (names.equals(currentNames)) {
            return contest.getCriteria();
        }
        if (contest.getId() != null && !evaluationRepository.findByContestId(contest.getId()).isEmpty()) {
            throw new ConflictException("Đã có phiếu chấm nên không thể đổi tiêu chí chấm");
        }
        Map<String, JudgingCriterion> existing = contest.getCriteria().stream()
                .collect(Collectors.toMap(JudgingCriterion::name, Function.identity(), (first, second) -> first));
        double weight = Math.round(TOTAL_WEIGHT / names.size() * 100) / 100.0;
        return names.stream().map(name -> {
            JudgingCriterion current = existing.get(name);
            String id = current == null ? "cr-" + UUID.randomUUID().toString().substring(0, 8) : current.id();
            return new JudgingCriterion(id, name, null, CRITERION_MAX_SCORE, weight);
        }).toList();
    }

    private List<String> validJudgeIds(List<String> judgeIds) {
        Set<String> valid = userRepository.findAllById(judgeIds).stream()
                .filter(user -> user.getRole() == Role.JUDGE)
                .map(BaseDocument::getId)
                .collect(Collectors.toSet());
        return judgeIds.stream().filter(valid::contains).distinct().toList();
    }

    private static List<Award> toAwards(List<PrizeDto> prizes) {
        List<PrizeRank> ranks = List.of(PrizeRank.FIRST, PrizeRank.SECOND, PrizeRank.THIRD);
        List<Award> awards = new ArrayList<>();
        for (int index = 0; index < prizes.size(); index++) {
            PrizeRank rank = index < ranks.size() ? ranks.get(index) : PrizeRank.HONORABLE;
            awards.add(new Award(rank, prizes.get(index).name().trim(), prizes.get(index).reward(), 1));
        }
        return awards;
    }

    private static JudgingRound defaultRound(Contest contest) {
        return new JudgingRound("rd-" + UUID.randomUUID().toString().substring(0, 8), "Vòng chấm", 1,
                contest.getJudgingStart(), contest.getJudgingEnd());
    }

    private static void syncRoundDates(Contest contest) {
        if (contest.getRounds().size() != 1) {
            return;
        }
        JudgingRound round = contest.getRounds().get(0);
        contest.setRounds(List.of(new JudgingRound(round.id(), round.name(), round.order(),
                contest.getJudgingStart(), contest.getJudgingEnd())));
    }

    private static void validateDates(ContestRequest request) {
        requireOrder(request.submissionStart(), request.submissionEnd(), "Hạn cuối nhận bài phải sau ngày bắt đầu");
        requireOrder(request.judgingStart(), request.judgingEnd(), "Ngày kết thúc chấm phải sau ngày bắt đầu chấm");
        requireOrder(request.submissionEnd(), request.judgingStart(), "Ngày bắt đầu chấm phải từ hạn cuối nhận bài trở đi");
    }

    private static void requireOrder(LocalDate first, LocalDate second, String message) {
        if (first != null && second != null && second.isBefore(first)) {
            throw new BadRequestException(message);
        }
    }

    private static boolean isSameSchedule(Contest contest, ContestRequest request) {
        return java.util.Objects.equals(AppDates.toDate(contest.getSubmissionStart()), request.submissionStart())
                && java.util.Objects.equals(AppDates.toDate(contest.getSubmissionEnd()), request.submissionEnd())
                && java.util.Objects.equals(AppDates.toDate(contest.getJudgingStart()), request.judgingStart())
                && java.util.Objects.equals(AppDates.toDate(contest.getJudgingEnd()), request.judgingEnd());
    }

    private String uniqueSlug(String title) {
        String base = Normalizer.normalize(title, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('đ', 'd').replace('Đ', 'D')
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        String slug = base.isEmpty() ? "cuoc-thi" : base;
        return contestRepository.findBySlug(slug).isPresent()
                ? slug + "-" + UUID.randomUUID().toString().substring(0, 6)
                : slug;
    }
}
