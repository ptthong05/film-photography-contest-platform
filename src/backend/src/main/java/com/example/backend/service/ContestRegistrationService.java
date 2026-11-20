package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.backend.dto.RegistrationRequest;
import com.example.backend.dto.RegistrationResponse;
import com.example.backend.entity.Contest;
import com.example.backend.entity.ContestRegistration;
import com.example.backend.enums.ContestStatus;
import com.example.backend.enums.RegistrationStatus;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ContestRegistrationRepository;
import com.example.backend.repository.ContestRepository;

@Service
public class ContestRegistrationService {

    private final ContestRegistrationRepository registrationRepository;
    private final ContestRepository contestRepository;

    public ContestRegistrationService(ContestRegistrationRepository registrationRepository,
                                      ContestRepository contestRepository) {
        this.registrationRepository = registrationRepository;
        this.contestRepository = contestRepository;
    }

    public RegistrationResponse registerForContest(RegistrationRequest request) {
        Contest contest = contestRepository.findById(request.getContestId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc thi với id: " + request.getContestId()));

        LocalDateTime now = LocalDateTime.now();
        if (contest.getStatus() == ContestStatus.ENDED || now.isAfter(contest.getEndDate())) {
            throw new IllegalArgumentException("Cuộc thi đã kết thúc, không thể đăng ký tham gia");
        }
        if (contest.getRegistrationDeadline() != null && now.isAfter(contest.getRegistrationDeadline())) {
            throw new IllegalArgumentException("Đã quá hạn chót đăng ký tham gia cuộc thi này");
        }
        if (registrationRepository.existsByContestIdAndUserId(contest.getId(), request.getUserId())) {
            throw new DuplicateResourceException("Bạn đã đăng ký tham gia cuộc thi này trước đó rồi");
        }

        ContestRegistration registration = new ContestRegistration();
        registration.setContest(contest);
        registration.setUserId(request.getUserId());
        registration.setStatus(RegistrationStatus.PENDING);
        registration.setNote(request.getNote());

        ContestRegistration saved = registrationRepository.save(registration);
        return toResponse(saved);
    }

    public List<RegistrationResponse> getRegistrationsByContest(Long contestId, RegistrationStatus status) {
        if (!contestRepository.existsById(contestId)) {
            throw new ResourceNotFoundException("Không tìm thấy cuộc thi với id: " + contestId);
        }
        List<ContestRegistration> registrations = (status != null)
                ? registrationRepository.findByContestIdAndStatus(contestId, status)
                : registrationRepository.findByContestId(contestId);

        return registrations.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<RegistrationResponse> getRegistrationsByUser(Long userId) {
        return registrationRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public RegistrationResponse reviewRegistration(Long id, RegistrationStatus newStatus, String note) {
        if (newStatus == null || newStatus == RegistrationStatus.PENDING) {
            throw new IllegalArgumentException("Trạng thái xét duyệt phải là APPROVED hoặc REJECTED");
        }

        ContestRegistration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đăng ký với id: " + id));

        registration.setStatus(newStatus);
        if (note != null) {
            registration.setNote(note);
        }
        registration.setReviewedAt(LocalDateTime.now());

        ContestRegistration updated = registrationRepository.save(registration);
        return toResponse(updated);
    }

    private RegistrationResponse toResponse(ContestRegistration registration) {
        RegistrationResponse response = new RegistrationResponse();
        response.setId(registration.getId());
        response.setContestId(registration.getContest().getId());
        response.setContestTitle(registration.getContest().getTitle());
        response.setUserId(registration.getUserId());
        response.setStatus(registration.getStatus());
        response.setNote(registration.getNote());
        response.setRegisteredAt(registration.getRegisteredAt());
        response.setReviewedAt(registration.getReviewedAt());
        return response;
    }
}