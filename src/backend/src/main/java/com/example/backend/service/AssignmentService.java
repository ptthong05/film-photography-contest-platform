package com.example.backend.service;

import com.example.backend.dto.AssignmentRequest;
import com.example.backend.dto.AssignmentResponse;
import com.example.backend.entity.BaseDocument;
import com.example.backend.entity.Contest;
import com.example.backend.entity.Evaluation;
import com.example.backend.entity.JudgeAssignment;
import com.example.backend.entity.Submission;
import com.example.backend.entity.User;
import com.example.backend.entity.embedded.JudgingRound;
import com.example.backend.enums.EvaluationStatus;
import com.example.backend.enums.NotificationType;
import com.example.backend.enums.Role;
import com.example.backend.enums.SubmissionStatus;
import com.example.backend.enums.UserStatus;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ContestRepository;
import com.example.backend.repository.EvaluationRepository;
import com.example.backend.repository.JudgeAssignmentRepository;
import com.example.backend.repository.SubmissionRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.AuthenticatedUser;
import com.example.backend.util.AppDates;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Phân công bài cho giám khảo. JudgeService đọc chính các bản ghi này để xác định phạm vi được chấm. */
@Service
public class AssignmentService {

    private final JudgeAssignmentRepository assignmentRepository;
    private final ContestRepository contestRepository;
    private final ContestService contestService;
    private final SubmissionRepository submissionRepository;
    private final EvaluationRepository evaluationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ActivityLogService activityLogService;

    public AssignmentService(
            JudgeAssignmentRepository assignmentRepository,
            ContestRepository contestRepository,
            ContestService contestService,
            SubmissionRepository submissionRepository,
            EvaluationRepository evaluationRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            ActivityLogService activityLogService) {
        this.assignmentRepository = assignmentRepository;
        this.contestRepository = contestRepository;
        this.contestService = contestService;
        this.submissionRepository = submissionRepository;
        this.evaluationRepository = evaluationRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.activityLogService = activityLogService;
    }

    public List<AssignmentResponse> getManaged(AuthenticatedUser actor) {
        List<Contest> contests = contestService.findManagedEntities(actor);
        Map<String, Contest> contestById = contests.stream().collect(Collectors.toMap(BaseDocument::getId, Function.identity()));
        List<JudgeAssignment> assignments = contests.stream()
                .flatMap(contest -> assignmentRepository.findByContestId(contest.getId()).stream())
                .toList();
        Map<String, User> judges = userRepository
                .findAllById(assignments.stream().map(JudgeAssignment::getJudgeId).collect(Collectors.toSet())).stream()
                .collect(Collectors.toMap(BaseDocument::getId, Function.identity()));
        return assignments.stream()
                .map(item -> toResponse(item, contestById.get(item.getContestId()), judges.get(item.getJudgeId())))
                .toList();
    }

    /** Gộp vào phân công sẵn có của giám khảo trong cuộc thi, tránh vi phạm unique (contest, round, judge) */
    public AssignmentResponse assign(AssignmentRequest request, AuthenticatedUser actor) {
        Contest contest = contestService.requireManaged(request.contestId(), actor);
        User judge = requireActiveJudge(request.judgeId());
        Set<String> verifiedIds = submissionRepository
                .findByContestIdAndStatus(contest.getId(), SubmissionStatus.VERIFIED).stream()
                .map(BaseDocument::getId)
                .collect(Collectors.toSet());
        List<String> requested = request.submissionIds().stream().distinct().toList();
        if (!verifiedIds.containsAll(requested)) {
            throw new BadRequestException("Chỉ phân công được bài đã duyệt của cuộc thi này");
        }
        String roundId = currentRound(contest).id();
        JudgeAssignment assignment = assignmentRepository.findByContestId(contest.getId()).stream()
                .filter(item -> item.getJudgeId().equals(judge.getId()) && roundId.equals(item.getRoundId()))
                .findFirst()
                .orElseGet(() -> {
                    JudgeAssignment created = new JudgeAssignment();
                    created.setContestId(contest.getId());
                    created.setRoundId(roundId);
                    created.setJudgeId(judge.getId());
                    return created;
                });
        Set<String> merged = new LinkedHashSet<>(assignment.getSubmissionIds());
        merged.addAll(requested);
        assignment.setSubmissionIds(new ArrayList<>(merged));
        assignment.setAssignedBy(actor.id());
        JudgeAssignment saved = assignmentRepository.save(assignment);

        notificationService.send(judge.getId(), NotificationType.ASSIGNMENT, "Phân công chấm mới",
                "Bạn được phân công " + requested.size() + " bài dự thi trong cuộc thi " + contest.getTitle() + ".", "assigned");
        activityLogService.log(actor.id(), actor.role(), "ASSIGNMENT_CREATE", "ASSIGNMENT", saved.getId(),
                judge.getName() + " - " + requested.size() + " bài");
        return toResponse(saved, contest, judge);
    }

    public AssignmentResponse reassign(String id, String newJudgeId, AuthenticatedUser actor) {
        JudgeAssignment assignment = requireAssignment(id);
        Contest contest = contestService.requireManaged(assignment.getContestId(), actor);
        User judge = requireActiveJudge(newJudgeId);
        JudgeAssignment existing = assignmentRepository.findByContestId(contest.getId()).stream()
                .filter(item -> item.getJudgeId().equals(newJudgeId) && item.getRoundId().equals(assignment.getRoundId()))
                .findFirst()
                .orElse(null);
        JudgeAssignment saved;
        if (existing == null) {
            assignment.setJudgeId(newJudgeId);
            saved = assignmentRepository.save(assignment);
        } else {
            Set<String> merged = new LinkedHashSet<>(existing.getSubmissionIds());
            merged.addAll(assignment.getSubmissionIds());
            existing.setSubmissionIds(new ArrayList<>(merged));
            saved = assignmentRepository.save(existing);
            assignmentRepository.delete(assignment);
        }
        notificationService.send(newJudgeId, NotificationType.ASSIGNMENT, "Phân công chấm mới",
                "Bạn được chuyển phân công chấm trong cuộc thi " + contest.getTitle() + ".", "assigned");
        activityLogService.log(actor.id(), actor.role(), "ASSIGNMENT_REASSIGN", "ASSIGNMENT", saved.getId(), judge.getName());
        return toResponse(saved, contest, judge);
    }

    public void revoke(String id, AuthenticatedUser actor) {
        JudgeAssignment assignment = requireAssignment(id);
        Contest contest = contestService.requireManaged(assignment.getContestId(), actor);
        assignmentRepository.delete(assignment);
        activityLogService.log(actor.id(), actor.role(), "ASSIGNMENT_REVOKE", "ASSIGNMENT", id, contest.getTitle());
    }

    public AssignmentResponse remind(String id, AuthenticatedUser actor) {
        JudgeAssignment assignment = requireAssignment(id);
        Contest contest = contestService.requireManaged(assignment.getContestId(), actor);
        assignment.setRemindersSent(assignment.getRemindersSent() + 1);
        JudgeAssignment saved = assignmentRepository.save(assignment);
        notificationService.send(assignment.getJudgeId(), NotificationType.DEADLINE, "Nhắc nhở chấm bài",
                "Ban tổ chức nhắc bạn hoàn thành chấm bài cuộc thi " + contest.getTitle() + ".", "assigned");
        User judge = userRepository.findById(assignment.getJudgeId()).orElse(null);
        return toResponse(saved, contest, judge);
    }

    private AssignmentResponse toResponse(JudgeAssignment assignment, Contest contest, User judge) {
        List<String> submissionIds = assignment.getSubmissionIds().isEmpty()
                ? submissionRepository.findByContestIdAndStatus(assignment.getContestId(), SubmissionStatus.VERIFIED).stream()
                        .map(Submission::getId).toList()
                : assignment.getSubmissionIds();
        Set<String> finalized = evaluationRepository.findByJudgeId(assignment.getJudgeId()).stream()
                .filter(item -> item.getStatus() == EvaluationStatus.FINALIZED)
                .filter(item -> assignment.getRoundId().equals(item.getRoundId()))
                .map(Evaluation::getSubmissionId)
                .collect(Collectors.toSet());
        return new AssignmentResponse(
                assignment.getId(),
                assignment.getContestId(),
                contest == null ? null : contest.getTitle(),
                assignment.getRoundId(),
                assignment.getJudgeId(),
                judge == null ? null : judge.getName(),
                judge == null ? null : judge.getEmail(),
                judge == null ? null : judge.getSpecialty(),
                submissionIds,
                submissionIds.stream().filter(finalized::contains).toList(),
                assignment.getRemindersSent(),
                contest == null ? null : AppDates.toDate(contest.getJudgingEnd()),
                assignment.getUpdatedAt());
    }

    private JudgeAssignment requireAssignment(String id) {
        return assignmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phân công"));
    }

    private User requireActiveJudge(String judgeId) {
        User judge = userRepository.findById(judgeId)
                .filter(user -> user.getRole() == Role.JUDGE)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giám khảo"));
        if (judge.getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Giám khảo đang bị khóa, không thể phân công");
        }
        return judge;
    }

    /** Cuộc thi cũ có thể chưa có vòng chấm: tạo vòng mặc định để phân công được */
    private JudgingRound currentRound(Contest contest) {
        if (contest.getRounds().isEmpty()) {
            JudgingRound round = new JudgingRound("rd-" + UUID.randomUUID().toString().substring(0, 8), "Vòng chấm", 1,
                    contest.getJudgingStart(), contest.getJudgingEnd());
            contest.setRounds(List.of(round));
            contestRepository.save(contest);
            return round;
        }
        return contest.getRounds().stream().max(Comparator.comparingInt(JudgingRound::order)).orElseThrow();
    }
}
