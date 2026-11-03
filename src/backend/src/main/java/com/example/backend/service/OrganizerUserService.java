package com.example.backend.service;

import com.example.backend.dto.OrganizerJudgeRequest;
import com.example.backend.dto.OrganizerJudgeResponse;
import com.example.backend.dto.OrganizerParticipantResponse;
import com.example.backend.entity.BaseDocument;
import com.example.backend.entity.Contest;
import com.example.backend.entity.ContestRegistration;
import com.example.backend.entity.JudgeAssignment;
import com.example.backend.entity.Submission;
import com.example.backend.entity.User;
import com.example.backend.enums.Role;
import com.example.backend.enums.UserStatus;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ContestRegistrationRepository;
import com.example.backend.repository.ContestRepository;
import com.example.backend.repository.EvaluationRepository;
import com.example.backend.repository.JudgeAssignmentRepository;
import com.example.backend.repository.SubmissionRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.AuthenticatedUser;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/** Organizer xem giám khảo và thí sinh; thí sinh chỉ thấy người có liên quan tới cuộc thi của Organizer đó. */
@Service
public class OrganizerUserService {

    private static final int TEMP_PASSWORD_BYTES = 9;

    private final UserRepository userRepository;
    private final ContestService contestService;
    private final ContestRepository contestRepository;
    private final SubmissionRepository submissionRepository;
    private final ContestRegistrationRepository registrationRepository;
    private final JudgeAssignmentRepository assignmentRepository;
    private final EvaluationRepository evaluationRepository;
    private final PasswordEncoder passwordEncoder;
    private final ActivityLogService activityLogService;
    private final SecureRandom random = new SecureRandom();

    public OrganizerUserService(
            UserRepository userRepository,
            ContestService contestService,
            ContestRepository contestRepository,
            SubmissionRepository submissionRepository,
            ContestRegistrationRepository registrationRepository,
            JudgeAssignmentRepository assignmentRepository,
            EvaluationRepository evaluationRepository,
            PasswordEncoder passwordEncoder,
            ActivityLogService activityLogService) {
        this.userRepository = userRepository;
        this.contestService = contestService;
        this.contestRepository = contestRepository;
        this.submissionRepository = submissionRepository;
        this.registrationRepository = registrationRepository;
        this.assignmentRepository = assignmentRepository;
        this.evaluationRepository = evaluationRepository;
        this.passwordEncoder = passwordEncoder;
        this.activityLogService = activityLogService;
    }

    public List<OrganizerJudgeResponse> getJudges() {
        return userRepository.findByRole(Role.JUDGE).stream().map(judge -> toJudgeResponse(judge, null)).toList();
    }

    /** Tạo tài khoản giám khảo thật với mật khẩu tạm; mật khẩu chỉ trả về đúng 1 lần trong response này */
    public OrganizerJudgeResponse createJudge(OrganizerJudgeRequest request, AuthenticatedUser actor) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email đã được sử dụng");
        }
        String temporaryPassword = generatePassword();
        User judge = new User();
        judge.setName(request.fullName().trim());
        judge.setEmail(email);
        judge.setSpecialty(request.specialty().trim());
        judge.setRole(Role.JUDGE);
        judge.setStatus(UserStatus.ACTIVE);
        judge.setPasswordHash(passwordEncoder.encode(temporaryPassword));
        User saved = userRepository.save(judge);
        activityLogService.log(actor.id(), actor.role(), "JUDGE_CREATE", "USER", saved.getId(), saved.getEmail());
        return toJudgeResponse(saved, temporaryPassword);
    }

    public OrganizerJudgeResponse setDefaultJudge(String judgeId, boolean isDefault) {
        User judge = userRepository.findById(judgeId)
                .filter(user -> user.getRole() == Role.JUDGE)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giám khảo"));
        judge.setDefaultJudge(isDefault);
        return toJudgeResponse(userRepository.save(judge), null);
    }

    public List<OrganizerParticipantResponse> getParticipants(AuthenticatedUser actor) {
        Map<String, Set<String>> contestIdsByParticipant = new HashMap<>();
        Map<String, Long> submissionCounts = new HashMap<>();
        for (Contest contest : contestService.findManagedEntities(actor)) {
            String contestId = contest.getId();
            for (ContestRegistration registration : registrationRepository.findByContestId(contestId)) {
                contestIdsByParticipant.computeIfAbsent(registration.getParticipantId(), key -> new HashSet<>()).add(contestId);
            }
            for (Submission submission : submissionRepository.findByContestId(contestId)) {
                contestIdsByParticipant.computeIfAbsent(submission.getParticipantId(), key -> new HashSet<>()).add(contestId);
                submissionCounts.merge(submission.getParticipantId(), 1L, Long::sum);
            }
        }
        return userRepository.findAllById(contestIdsByParticipant.keySet()).stream()
                .sorted(Comparator.comparing(BaseDocument::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(user -> new OrganizerParticipantResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getPhone(),
                        submissionCounts.getOrDefault(user.getId(), 0L),
                        user.getCreatedAt(),
                        user.getStatus(),
                        new ArrayList<>(contestIdsByParticipant.get(user.getId()))))
                .toList();
    }

    /** Khóa thật tài khoản thí sinh; chỉ áp dụng với thí sinh của cuộc thi mình quản lý */
    public OrganizerParticipantResponse updateParticipantStatus(String participantId, UserStatus status, AuthenticatedUser actor) {
        boolean isManaged = getParticipants(actor).stream().anyMatch(item -> item.id().equals(participantId));
        User user = userRepository.findById(participantId)
                .filter(item -> isManaged && item.getRole() == Role.PARTICIPANT)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thí sinh"));
        user.setStatus(status);
        userRepository.save(user);
        activityLogService.log(actor.id(), actor.role(), "PARTICIPANT_STATUS", "USER", participantId, status.name());
        return getParticipants(actor).stream().filter(item -> item.id().equals(participantId)).findFirst().orElseThrow();
    }

    private OrganizerJudgeResponse toJudgeResponse(User judge, String temporaryPassword) {
        Set<String> contestIds = new HashSet<>();
        assignmentRepository.findByJudgeId(judge.getId()).stream().map(JudgeAssignment::getContestId).forEach(contestIds::add);
        contestRepository.findAll().stream()
                .filter(contest -> contest.getJudgeIds().contains(judge.getId()))
                .map(BaseDocument::getId)
                .forEach(contestIds::add);
        return new OrganizerJudgeResponse(judge.getId(), judge.getName(), judge.getEmail(), judge.getSpecialty(),
                contestIds.size(), judge.getStatus(), judge.isDefaultJudge(),
                evaluationRepository.findByJudgeId(judge.getId()).size(), judge.getCreatedAt(), temporaryPassword);
    }

    private String generatePassword() {
        byte[] bytes = new byte[TEMP_PASSWORD_BYTES];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
