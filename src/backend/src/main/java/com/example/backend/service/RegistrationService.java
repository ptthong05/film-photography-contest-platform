package com.example.backend.service;

import com.example.backend.dto.RegistrationResponse;
import com.example.backend.entity.BaseDocument;
import com.example.backend.entity.Contest;
import com.example.backend.entity.ContestRegistration;
import com.example.backend.enums.ContestStatus;
import com.example.backend.enums.RegistrationStatus;
import com.example.backend.exception.ConflictException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ContestRegistrationRepository;
import com.example.backend.repository.SubmissionRepository;
import com.example.backend.security.AuthenticatedUser;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** Đăng ký tham gia được duyệt ngay: chưa có quy trình Organizer xét duyệt đăng ký. */
@Service
public class RegistrationService {

    private final ContestRegistrationRepository registrationRepository;
    private final SubmissionRepository submissionRepository;
    private final ContestService contestService;
    private final com.example.backend.repository.ContestRepository contestRepository;
    private final ActivityLogService activityLogService;

    public RegistrationService(
            ContestRegistrationRepository registrationRepository,
            SubmissionRepository submissionRepository,
            ContestService contestService,
            com.example.backend.repository.ContestRepository contestRepository,
            ActivityLogService activityLogService) {
        this.registrationRepository = registrationRepository;
        this.submissionRepository = submissionRepository;
        this.contestService = contestService;
        this.contestRepository = contestRepository;
        this.activityLogService = activityLogService;
    }

    public List<RegistrationResponse> getMine(String participantId) {
        List<ContestRegistration> registrations = registrationRepository.findByParticipantId(participantId);
        Map<String, String> titles = contestRepository
                .findAllById(registrations.stream().map(ContestRegistration::getContestId).collect(Collectors.toSet())).stream()
                .collect(Collectors.toMap(BaseDocument::getId, Contest::getTitle));
        return registrations.stream().map(item -> toResponse(item, titles.get(item.getContestId()))).toList();
    }

    public RegistrationResponse register(String contestId, AuthenticatedUser participant) {
        Contest contest = contestService.requireContest(contestId);
        ContestStatus status = ContestService.effectiveStatus(contest, Instant.now());
        if (status != ContestStatus.UPCOMING && status != ContestStatus.ONGOING) {
            throw new ConflictException("Cuộc thi đã hết thời gian đăng ký");
        }
        if (registrationRepository.findByContestIdAndParticipantId(contestId, participant.id()).isPresent()) {
            throw new ConflictException("Bạn đã đăng ký cuộc thi này");
        }
        ContestRegistration registration = new ContestRegistration();
        registration.setContestId(contestId);
        registration.setParticipantId(participant.id());
        registration.setStatus(RegistrationStatus.APPROVED);
        ContestRegistration saved = registrationRepository.save(registration);
        activityLogService.log(participant.id(), participant.role(), "CONTEST_REGISTER", "CONTEST", contestId, contest.getTitle());
        return toResponse(saved, contest.getTitle());
    }

    /** Đã nộp bài thì không hủy được để không còn bài của người không đăng ký */
    public void cancel(String contestId, AuthenticatedUser participant) {
        ContestRegistration registration = registrationRepository
                .findByContestIdAndParticipantId(contestId, participant.id())
                .orElseThrow(() -> new ResourceNotFoundException("Bạn chưa đăng ký cuộc thi này"));
        if (submissionRepository.countByContestIdAndParticipantId(contestId, participant.id()) > 0) {
            throw new ConflictException("Bạn đã nộp bài cho cuộc thi này nên không thể hủy đăng ký");
        }
        registrationRepository.delete(registration);
        activityLogService.log(participant.id(), participant.role(), "CONTEST_UNREGISTER", "CONTEST", contestId, null);
    }

    private static RegistrationResponse toResponse(ContestRegistration item, String contestTitle) {
        return new RegistrationResponse(item.getId(), item.getContestId(), contestTitle, item.getParticipantId(),
                item.getStatus(), item.getCreatedAt());
    }
}
