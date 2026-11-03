package com.example.backend.service;

import com.example.backend.dto.SubmissionRequest;
import com.example.backend.dto.SubmissionResponse;
import com.example.backend.entity.BaseDocument;
import com.example.backend.entity.Contest;
import com.example.backend.entity.Submission;
import com.example.backend.entity.User;
import com.example.backend.entity.embedded.FilmMetadata;
import com.example.backend.enums.EvaluationStatus;
import com.example.backend.enums.NotificationType;
import com.example.backend.enums.RegistrationStatus;
import com.example.backend.enums.Role;
import com.example.backend.enums.SubmissionStatus;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ConflictException;
import com.example.backend.exception.ForbiddenOperationException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ContestRegistrationRepository;
import com.example.backend.repository.ContestRepository;
import com.example.backend.repository.EvaluationRepository;
import com.example.backend.repository.SubmissionRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.AuthenticatedUser;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Nộp bài của thí sinh và duyệt bài của Organizer / Admin. */
@Service
public class SubmissionService {

    private static final String NOT_FOUND_MESSAGE = "Không tìm thấy bài dự thi";

    private final SubmissionRepository submissionRepository;
    private final ContestRepository contestRepository;
    private final ContestRegistrationRepository registrationRepository;
    private final EvaluationRepository evaluationRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;
    private final ActivityLogService activityLogService;

    public SubmissionService(
            SubmissionRepository submissionRepository,
            ContestRepository contestRepository,
            ContestRegistrationRepository registrationRepository,
            EvaluationRepository evaluationRepository,
            UserRepository userRepository,
            FileStorageService fileStorageService,
            NotificationService notificationService,
            ActivityLogService activityLogService) {
        this.submissionRepository = submissionRepository;
        this.contestRepository = contestRepository;
        this.registrationRepository = registrationRepository;
        this.evaluationRepository = evaluationRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.notificationService = notificationService;
        this.activityLogService = activityLogService;
    }

    public SubmissionResponse submit(SubmissionRequest request, MultipartFile file, MultipartFile negativeFile,
                                     AuthenticatedUser participant) {
        if (request.contestId() == null || request.contestId().isBlank()) {
            throw new BadRequestException("Vui lòng chọn cuộc thi");
        }
        Contest contest = contestRepository.findById(request.contestId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc thi"));
        boolean isRegistered = registrationRepository
                .findByContestIdAndParticipantId(contest.getId(), participant.id())
                .filter(item -> item.getStatus() == RegistrationStatus.APPROVED)
                .isPresent();
        if (!isRegistered) {
            throw new ConflictException("Bạn cần đăng ký cuộc thi trước khi nộp bài");
        }
        if (!ContestService.isAcceptingSubmissions(contest, Instant.now())) {
            throw new ConflictException("Cuộc thi hiện không nhận bài dự thi");
        }
        long submittedCount = submissionRepository.countByContestIdAndParticipantId(contest.getId(), participant.id());
        if (submittedCount >= contest.getMaxPhotosPerParticipant()) {
            throw new ConflictException("Bạn đã nộp đủ " + contest.getMaxPhotosPerParticipant() + " ảnh tối đa của cuộc thi này");
        }

        Submission submission = new Submission();
        submission.setContestId(contest.getId());
        submission.setParticipantId(participant.id());
        applyRequest(submission, request);
        String imageUrl = fileStorageService.storeImage(file);
        submission.setImageUrls(List.of(imageUrl));
        submission.setThumbnailUrls(List.of(imageUrl));
        if (negativeFile != null && !negativeFile.isEmpty()) {
            submission.setNegativeUrls(List.of(fileStorageService.storeImage(negativeFile)));
        }
        Submission saved = submissionRepository.save(submission);

        notificationService.send(contest.getOrganizerId(), NotificationType.NEW_SUBMISSION, "Bài dự thi mới",
                "Có bài dự thi mới \"" + saved.getTitle() + "\" trong cuộc thi " + contest.getTitle() + ".", "submissions");
        activityLogService.log(participant.id(), participant.role(), "SUBMISSION_CREATE", "SUBMISSION", saved.getId(), saved.getTitle());
        return toResponses(List.of(saved)).get(0);
    }

    public List<SubmissionResponse> getMine(String participantId) {
        return toResponses(submissionRepository.findByParticipantId(participantId).stream()
                .sorted(Comparator.comparing(BaseDocument::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList());
    }

    /** Thí sinh chỉ sửa khi bài còn chờ duyệt và cuộc thi còn nhận bài */
    public SubmissionResponse updateMine(String id, SubmissionRequest request, MultipartFile file, AuthenticatedUser participant) {
        Submission submission = requireOwned(id, participant);
        requireEditable(submission);
        applyRequest(submission, request);
        if (file != null && !file.isEmpty()) {
            String imageUrl = fileStorageService.storeImage(file);
            submission.setImageUrls(List.of(imageUrl));
            submission.setThumbnailUrls(List.of(imageUrl));
        }
        Submission saved = submissionRepository.save(submission);
        return toResponses(List.of(saved)).get(0);
    }

    public void deleteMine(String id, AuthenticatedUser participant) {
        Submission submission = requireOwned(id, participant);
        requireEditable(submission);
        submissionRepository.delete(submission);
        activityLogService.log(participant.id(), participant.role(), "SUBMISSION_DELETE", "SUBMISSION", id, submission.getTitle());
    }

    /** Organizer thấy bài của cuộc thi mình quản lý, Admin thấy tất cả */
    public List<SubmissionResponse> getManaged(String contestId, AuthenticatedUser actor) {
        List<Contest> contests = actor.role() == Role.ADMIN
                ? contestRepository.findAll()
                : contestRepository.findByOrganizerId(actor.id());
        Set<String> contestIds = contests.stream()
                .map(BaseDocument::getId)
                .filter(id -> contestId == null || contestId.equals(id))
                .collect(Collectors.toSet());
        return toResponses(contestIds.stream()
                .flatMap(id -> submissionRepository.findByContestId(id).stream())
                .sorted(Comparator.comparing(BaseDocument::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList());
    }

    public SubmissionResponse getOne(String id, AuthenticatedUser actor) {
        Submission submission = requireSubmission(id);
        boolean isOwner = submission.getParticipantId().equals(actor.id());
        if (!isOwner && !canManage(submission, actor)) {
            throw new ResourceNotFoundException(NOT_FOUND_MESSAGE);
        }
        return toResponses(List.of(submission)).get(0);
    }

    public SubmissionResponse updateStatus(String id, SubmissionStatus status, String reason, AuthenticatedUser actor) {
        Submission submission = requireSubmission(id);
        if (!canManage(submission, actor)) {
            throw new ForbiddenOperationException("Bạn không quản lý cuộc thi của bài dự thi này");
        }
        boolean hasFinalEvaluation = evaluationRepository
                .findBySubmissionIdAndStatus(id, EvaluationStatus.FINALIZED).stream().findAny().isPresent();
        if (hasFinalEvaluation && status != SubmissionStatus.VERIFIED) {
            throw new ConflictException("Bài đã có phiếu chấm chính thức, không thể đổi trạng thái duyệt");
        }
        if (status == SubmissionStatus.REJECTED && (reason == null || reason.isBlank())) {
            reason = "Bài dự thi không đáp ứng thể lệ cuộc thi";
        }
        submission.setStatus(status);
        submission.setRejectionReason(status == SubmissionStatus.REJECTED ? reason : null);
        Submission saved = submissionRepository.save(submission);

        if (status != SubmissionStatus.PENDING) {
            String verdict = status == SubmissionStatus.VERIFIED ? "đã được duyệt" : "đã bị từ chối: " + reason;
            notificationService.send(saved.getParticipantId(), NotificationType.SUBMISSION_STATUS, "Cập nhật bài dự thi",
                    "Bài dự thi \"" + saved.getTitle() + "\" " + verdict + ".", "my-entries");
        }
        activityLogService.log(actor.id(), actor.role(), "SUBMISSION_REVIEW", "SUBMISSION", id, status.name());
        return toResponses(List.of(saved)).get(0);
    }

    public List<SubmissionResponse> toResponses(List<Submission> submissions) {
        Map<String, Contest> contests = contestRepository
                .findAllById(submissions.stream().map(Submission::getContestId).collect(Collectors.toSet())).stream()
                .collect(Collectors.toMap(BaseDocument::getId, Function.identity()));
        Map<String, User> authors = userRepository
                .findAllById(submissions.stream().map(Submission::getParticipantId).collect(Collectors.toSet())).stream()
                .collect(Collectors.toMap(BaseDocument::getId, Function.identity()));
        return submissions.stream().map(item -> {
            Contest contest = contests.get(item.getContestId());
            User author = authors.get(item.getParticipantId());
            boolean isPublished = contest != null && contest.getResultPublishedAt() != null;
            return new SubmissionResponse(
                    item.getId(),
                    codeOf(item.getId()),
                    item.getContestId(),
                    contest == null ? null : contest.getTitle(),
                    item.getParticipantId(),
                    author == null ? null : author.getName(),
                    author == null ? null : author.getEmail(),
                    item.getTitle(),
                    item.getDescription(),
                    item.getCategory(),
                    item.getImageUrls(),
                    item.getThumbnailUrls(),
                    item.getNegativeUrls(),
                    item.getContactSheetUrl(),
                    item.getMetadata(),
                    item.getStatus(),
                    item.getRejectionReason(),
                    item.getAiVerification(),
                    item.getTotalScore(),
                    item.getPrizeRank(),
                    isPublished,
                    item.getCreatedAt());
        }).toList();
    }

    private static String codeOf(String id) {
        return "SUB-" + id.substring(Math.max(0, id.length() - 6)).toUpperCase(Locale.ROOT);
    }

    private static void applyRequest(Submission submission, SubmissionRequest request) {
        submission.setTitle(request.title().trim());
        submission.setDescription(request.description());
        submission.setCategory(request.category());
        submission.setMetadata(new FilmMetadata(
                request.filmBrand(),
                request.filmStock(),
                request.iso(),
                request.camera(),
                request.lens(),
                request.format(),
                request.frameNumber(),
                request.shootingDate(),
                request.shootingLocation(),
                request.developingLab(),
                request.scanningSpecs()));
    }

    private Submission requireSubmission(String id) {
        return submissionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MESSAGE));
    }

    private Submission requireOwned(String id, AuthenticatedUser participant) {
        Submission submission = requireSubmission(id);
        if (!submission.getParticipantId().equals(participant.id())) {
            throw new ResourceNotFoundException(NOT_FOUND_MESSAGE);
        }
        return submission;
    }

    private void requireEditable(Submission submission) {
        if (submission.getStatus() != SubmissionStatus.PENDING) {
            throw new ConflictException("Chỉ sửa hoặc xóa được bài đang chờ duyệt");
        }
        Contest contest = contestRepository.findById(submission.getContestId()).orElse(null);
        if (contest == null || !ContestService.isAcceptingSubmissions(contest, Instant.now())) {
            throw new ConflictException("Cuộc thi đã hết thời gian nhận bài");
        }
    }

    private boolean canManage(Submission submission, AuthenticatedUser actor) {
        return contestRepository.findById(submission.getContestId())
                .map(contest -> ContestService.canManage(contest, actor))
                .orElse(false);
    }
}
