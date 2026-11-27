package com.example.backend.service;

import com.example.backend.dto.AssignmentRequest;
import com.example.backend.dto.AssignmentResponse;
import com.example.backend.dto.AssignmentSetupResponse;
import com.example.backend.dto.JudgingCriterionResponse;
import com.example.backend.dto.JudgingRoundResponse;
import com.example.backend.dto.SubmissionSummaryResponse;
import com.example.backend.entity.Contest;
import com.example.backend.entity.Evaluation;
import com.example.backend.entity.JudgeAssignment;
import com.example.backend.entity.Round;
import com.example.backend.entity.Submission;
import com.example.backend.entity.User;
import com.example.backend.enums.EvaluationStatus;
import com.example.backend.enums.NotificationType;
import com.example.backend.enums.Role;
import com.example.backend.enums.SubmissionStatus;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ContestRepository;
import com.example.backend.repository.EvaluationRepository;
import com.example.backend.repository.JudgeAssignmentRepository;
import com.example.backend.repository.JudgingCriterionRepository;
import com.example.backend.repository.RoundRepository;
import com.example.backend.repository.SubmissionRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.AuthenticatedUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Phân công bài cho giám khảo. JudgeService đọc chính các bản ghi này để xác định phạm vi được chấm.
 * Contest chưa lưu ban tổ chức nào sở hữu cuộc thi nên mọi ORGANIZER/ADMIN đều quản lý được mọi phân công.
 */
@Service
public class AssignmentService {

    private static final String ACTIVE_STATUS = "ACTIVE";
    private static final String DEFAULT_ROUND_NAME = "Vòng chấm 1";
    private static final LocalTime END_OF_DAY = LocalTime.of(23, 59);
    private static final DateTimeFormatter DEADLINE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final JudgeAssignmentRepository assignmentRepository;
    private final ContestRepository contestRepository;
    private final RoundRepository roundRepository;
    private final SubmissionRepository submissionRepository;
    private final EvaluationRepository evaluationRepository;
    private final UserRepository userRepository;
    private final JudgingCriterionRepository criterionRepository;
    private final NotificationService notificationService;

    public AssignmentService(
            JudgeAssignmentRepository assignmentRepository,
            ContestRepository contestRepository,
            RoundRepository roundRepository,
            SubmissionRepository submissionRepository,
            EvaluationRepository evaluationRepository,
            UserRepository userRepository,
            JudgingCriterionRepository criterionRepository,
            NotificationService notificationService) {
        this.notificationService = notificationService;
        this.assignmentRepository = assignmentRepository;
        this.contestRepository = contestRepository;
        this.roundRepository = roundRepository;
        this.submissionRepository = submissionRepository;
        this.evaluationRepository = evaluationRepository;
        this.userRepository = userRepository;
        this.criterionRepository = criterionRepository;
    }

    public List<AssignmentResponse> getAll() {
        return assignmentRepository.findAll().stream().map(this::toResponse).toList();
    }

    /**
     * Vòng, tiêu chí và bài đã duyệt của một cuộc thi để ban tổ chức phân công.
     * Đọc thẳng repository vì API vòng thi (tv2) và bài dự thi (tv3) chưa dùng được từ giao diện.
     */
    public AssignmentSetupResponse getSetup(String contestId) {
        Contest contest = requireContest(parseId(contestId, "Mã cuộc thi không hợp lệ"));
        return new AssignmentSetupResponse(
                String.valueOf(contest.getId()),
                contest.getTitle(),
                roundRepository.findByContestIdOrderByRoundOrderAsc(contest.getId()).stream()
                        .map(JudgingRoundResponse::fromEntity)
                        .toList(),
                criterionRepository.findByContestIdOrderByDisplayOrderAsc(contest.getId()).stream()
                        .map(JudgingCriterionResponse::fromEntity)
                        .toList(),
                submissionRepository
                        .findByContestIdAndStatus(String.valueOf(contest.getId()), SubmissionStatus.VERIFIED).stream()
                        .sorted(Comparator.comparing(Submission::getCreatedAt))
                        .map(SubmissionSummaryResponse::fromEntity)
                        .toList());
    }

    /** Gộp vào phân công sẵn có của giám khảo ở cùng vòng, tránh vi phạm unique (contest, round, judge) */
    @Transactional
    public AssignmentResponse assign(AssignmentRequest request, AuthenticatedUser actor) {
        Contest contest = requireContest(parseId(request.contestId(), "Mã cuộc thi không hợp lệ"));
        User judge = requireActiveJudge(request.judgeId());
        Round round = resolveRound(contest, request.roundId(), request.deadline());

        Set<String> verifiedIds = submissionRepository
                .findByContestIdAndStatus(String.valueOf(contest.getId()), SubmissionStatus.VERIFIED).stream()
                .map(Submission::getId)
                .collect(Collectors.toSet());
        List<String> requested = request.submissionIds().stream().distinct().toList();
        if (!verifiedIds.containsAll(requested)) {
            throw new BadRequestException("Chỉ phân công được bài đã duyệt của cuộc thi này");
        }

        JudgeAssignment assignment = assignmentRepository
                .findByContestIdAndRoundIdAndJudgeId(contest.getId(), round.getId(), judge.getId())
                .orElseGet(() -> {
                    JudgeAssignment created = new JudgeAssignment();
                    created.setContestId(contest.getId());
                    created.setRoundId(round.getId());
                    created.setJudgeId(judge.getId());
                    return created;
                });
        Set<String> merged = new LinkedHashSet<>(assignment.getSubmissionIds());
        int before = merged.size();
        merged.addAll(requested);
        int added = merged.size() - before;
        assignment.setSubmissionIds(new ArrayList<>(merged));
        assignment.setAssignedBy(actor.id());
        AssignmentResponse response = toResponse(assignmentRepository.save(assignment));
        // Bấm phân công lại đúng các bài cũ thì không báo trùng
        if (added > 0) {
            notificationService.notify(judge.getId(), NotificationType.ASSIGNMENT, String.format(
                    "Ban tổ chức đã phân công bạn chấm %d bài dự thi của cuộc thi \"%s\" (%s).%s",
                    added, contest.getTitle(), round.getName(), deadlineText(response.deadline())));
        }
        return response;
    }

    /** Chuyển phân công sang giám khảo khác; phiếu chấm đã có vẫn thuộc giám khảo cũ */
    @Transactional
    public AssignmentResponse reassign(String id, String newJudgeId, AuthenticatedUser actor) {
        JudgeAssignment assignment = requireAssignment(id);
        if (assignment.getJudgeId().equals(newJudgeId)) {
            return toResponse(assignment);
        }
        requireActiveJudge(newJudgeId);
        JudgeAssignment existing = assignmentRepository
                .findByContestIdAndRoundIdAndJudgeId(assignment.getContestId(), assignment.getRoundId(), newJudgeId)
                .orElse(null);
        JudgeAssignment saved;
        if (existing == null) {
            assignment.setJudgeId(newJudgeId);
            assignment.setAssignedBy(actor.id());
            saved = assignmentRepository.save(assignment);
        } else {
            // Giám khảo mới đã có phân công ở vòng này: gộp bài vào đó để giữ unique (contest, round, judge)
            Set<String> merged = new LinkedHashSet<>(existing.getSubmissionIds());
            merged.addAll(assignment.getSubmissionIds());
            existing.setSubmissionIds(new ArrayList<>(merged));
            existing.setAssignedBy(actor.id());
            saved = assignmentRepository.save(existing);
            assignmentRepository.delete(assignment);
        }
        AssignmentResponse response = toResponse(saved);
        notificationService.notify(newJudgeId, NotificationType.ASSIGNMENT, String.format(
                "Ban tổ chức đã chuyển cho bạn %d bài dự thi của cuộc thi \"%s\".%s",
                assignment.getSubmissionIds().isEmpty()
                        ? response.submissionIds().size()
                        : assignment.getSubmissionIds().size(),
                contestTitle(response), deadlineText(response.deadline())));
        return response;
    }

    @Transactional
    public void revoke(String id) {
        assignmentRepository.delete(requireAssignment(id));
    }

    /** Đếm số lần nhắc và gửi thông báo hạn chấm tới giám khảo */
    @Transactional
    public AssignmentResponse remind(String id) {
        JudgeAssignment assignment = requireAssignment(id);
        assignment.setRemindersSent(assignment.getRemindersSent() + 1);
        AssignmentResponse response = toResponse(assignmentRepository.save(assignment));
        int total = response.submissionIds().size();
        int pending = total - response.reviewedSubmissionIds().size();
        String progress = pending > 0
                ? String.format("Bạn còn %d/%d bài chưa chấm", pending, total)
                : String.format("Bạn đã chấm xong %d bài, vui lòng kiểm tra lại các phiếu", total);
        notificationService.notify(assignment.getJudgeId(), NotificationType.DEADLINE, String.format(
                "Nhắc nhở từ Ban tổ chức: %s ở cuộc thi \"%s\".%s",
                progress, contestTitle(response), deadlineText(response.deadline())));
        return response;
    }

    private static String contestTitle(AssignmentResponse response) {
        return response.contestTitle() == null ? "#" + response.contestId() : response.contestTitle();
    }

    private static String deadlineText(LocalDate deadline) {
        return deadline == null ? "" : " Hạn chấm: " + deadline.format(DEADLINE_FORMAT) + ".";
    }

    private AssignmentResponse toResponse(JudgeAssignment assignment) {
        Contest contest = contestRepository.findById(assignment.getContestId()).orElse(null);
        Round round = roundRepository.findById(assignment.getRoundId()).orElse(null);
        User judge = userRepository.findById(assignment.getJudgeId()).orElse(null);
        List<String> submissionIds = assignment.getSubmissionIds().isEmpty()
                ? submissionRepository
                        .findByContestIdAndStatus(String.valueOf(assignment.getContestId()), SubmissionStatus.VERIFIED)
                        .stream()
                        .map(Submission::getId)
                        .toList()
                : List.copyOf(assignment.getSubmissionIds());
        Set<String> finalized = evaluationRepository.findByJudgeId(assignment.getJudgeId()).stream()
                .filter(item -> item.getStatus() == EvaluationStatus.FINALIZED)
                .filter(item -> assignment.getRoundId().equals(item.getRoundId()))
                .map(Evaluation::getSubmissionId)
                .collect(Collectors.toSet());
        return new AssignmentResponse(
                assignment.getId(),
                String.valueOf(assignment.getContestId()),
                contest == null ? null : contest.getTitle(),
                String.valueOf(assignment.getRoundId()),
                assignment.getJudgeId(),
                judge == null ? null : judge.getName(),
                judge == null ? null : judge.getEmail(),
                // User chưa có trường chuyên môn
                null,
                submissionIds,
                submissionIds.stream().filter(finalized::contains).toList(),
                assignment.getRemindersSent(),
                round == null || round.getEndDate() == null ? null : round.getEndDate().toLocalDate(),
                assignment.getUpdatedAt());
    }

    /**
     * roundId trống = vòng mới nhất; có roundId thì vòng đó phải thuộc cuộc thi.
     * Có deadline: cuộc thi chưa có vòng thì tạo vòng chấm đầu tiên, có rồi thì dời ngày kết thúc của vòng về deadline.
     */
    private Round resolveRound(Contest contest, String roundId, LocalDate deadline) {
        if (deadline != null && deadline.isBefore(LocalDate.now())) {
            throw new BadRequestException("Hạn chấm phải từ hôm nay trở đi");
        }
        List<Round> rounds = roundRepository.findByContestIdOrderByRoundOrderAsc(contest.getId());
        if (rounds.isEmpty()) {
            if (deadline == null) {
                throw new BadRequestException("Cuộc thi chưa có vòng chấm, vui lòng chọn hạn chấm để tạo vòng");
            }
            Round created = new Round();
            created.setContest(contest);
            created.setName(DEFAULT_ROUND_NAME);
            created.setRoundOrder(1);
            created.setStartDate(LocalDateTime.now());
            created.setEndDate(deadline.atTime(END_OF_DAY));
            return roundRepository.save(created);
        }
        Round round;
        if (roundId == null || roundId.isBlank()) {
            round = rounds.stream().max(Comparator.comparingInt(JudgeService::order)).orElseThrow();
        } else {
            Long id = parseId(roundId, "Mã vòng chấm không hợp lệ");
            round = rounds.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new BadRequestException("Vòng chấm không thuộc cuộc thi này"));
        }
        if (deadline != null && (round.getEndDate() == null || !deadline.equals(round.getEndDate().toLocalDate()))) {
            round.setEndDate(deadline.atTime(END_OF_DAY));
            round = roundRepository.save(round);
        }
        return round;
    }

    private Contest requireContest(Long contestId) {
        return contestRepository.findById(contestId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc thi"));
    }

    private JudgeAssignment requireAssignment(String id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phân công"));
    }

    private User requireActiveJudge(String judgeId) {
        User judge = userRepository.findById(judgeId)
                .filter(user -> user.getRole() == Role.JUDGE)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giám khảo"));
        if (!ACTIVE_STATUS.equals(judge.getStatus())) {
            throw new BadRequestException("Giám khảo đang bị khóa, không thể phân công");
        }
        return judge;
    }

    private static Long parseId(String value, String message) {
        try {
            return Long.valueOf(value.trim());
        } catch (NumberFormatException ex) {
            throw new BadRequestException(message);
        }
    }
}
