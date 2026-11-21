package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.backend.dto.ContestRequest;
import com.example.backend.dto.ContestResponse;
import com.example.backend.entity.Category;
import com.example.backend.entity.Contest;
import com.example.backend.enums.ContestStatus;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ContestRepository;

@Service
public class ContestService {

    private final ContestRepository contestRepository;
    private final CategoryRepository categoryRepository;

    public ContestService(ContestRepository contestRepository, CategoryRepository categoryRepository) {
        this.contestRepository = contestRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<ContestResponse> getAllContests(ContestStatus status, Long categoryId, String keyword) {
        List<Contest> contests;

        if (keyword != null && !keyword.trim().isEmpty()) {
            contests = contestRepository.findByTitleContainingIgnoreCase(keyword.trim());
        } else if (status != null) {
            contests = contestRepository.findByStatusOrderByStartDateAsc(status);
        } else if (categoryId != null) {
            contests = contestRepository.findByCategoryId(categoryId);
        } else {
            contests = contestRepository.findAll();
        }

        return contests.stream()
                .map(this::syncStatusAndToResponse)
                .collect(Collectors.toList());
    }

    public ContestResponse getContestById(Long id) {
        Contest contest = contestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc thi với id: " + id));
        return syncStatusAndToResponse(contest);
    }

    public ContestResponse createContest(ContestRequest request) {
        validateContestDates(request);

        Contest contest = new Contest();
        mapRequestToEntity(request, contest);

        ContestStatus computedStatus = calculateRealtimeStatus(request.getStartDate(), request.getEndDate());
        contest.setStatus(request.getStatus() != null ? request.getStatus() : computedStatus);

        Contest saved = contestRepository.save(contest);
        return toResponse(saved);
    }

    public ContestResponse updateContest(Long id, ContestRequest request) {
        Contest contest = contestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc thi với id: " + id));

        validateContestDates(request);
        mapRequestToEntity(request, contest);

        if (request.getStatus() != null) {
            contest.setStatus(request.getStatus());
        } else {
            contest.setStatus(calculateRealtimeStatus(contest.getStartDate(), contest.getEndDate()));
        }

        Contest updated = contestRepository.save(contest);
        return toResponse(updated);
    }

    public void deleteContest(Long id) {
        Contest contest = contestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc thi với id: " + id));
        contestRepository.delete(contest);
    }

    private void validateContestDates(ContestRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())
                || request.getEndDate().isEqual(request.getStartDate())) {
            throw new IllegalArgumentException("Thời gian kết thúc cuộc thi phải sau thời gian bắt đầu");
        }
        if (request.getRegistrationDeadline() != null
                && request.getRegistrationDeadline().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Hạn chót đăng ký không được vượt quá thời gian kết thúc cuộc thi");
        }
    }

    private void mapRequestToEntity(ContestRequest request, Contest contest) {
        contest.setTitle(request.getTitle().trim());
        contest.setDescription(request.getDescription());
        contest.setBannerUrl(request.getBannerUrl());
        contest.setOrganizer(request.getOrganizer());
        contest.setStartDate(request.getStartDate());
        contest.setEndDate(request.getEndDate());
        contest.setRegistrationDeadline(request.getRegistrationDeadline());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thể loại với id: " + request.getCategoryId()));
            contest.setCategory(category);
        } else {
            contest.setCategory(null);
        }
    }

    private ContestStatus calculateRealtimeStatus(LocalDateTime startDate, LocalDateTime endDate) {
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(startDate)) {
            return ContestStatus.UPCOMING;
        }
        if (now.isAfter(endDate)) {
            return ContestStatus.ENDED;
        }
        return ContestStatus.ACTIVE;
    }

    private ContestResponse syncStatusAndToResponse(Contest contest) {
        ContestStatus realtimeStatus = calculateRealtimeStatus(contest.getStartDate(), contest.getEndDate());
        if (contest.getStatus() != realtimeStatus) {
            contest.setStatus(realtimeStatus);
            contest = contestRepository.save(contest);
        }
        return toResponse(contest);
    }

    private ContestResponse toResponse(Contest contest) {
        ContestResponse response = new ContestResponse();
        response.setId(contest.getId());
        response.setTitle(contest.getTitle());
        response.setDescription(contest.getDescription());
        response.setBannerUrl(contest.getBannerUrl());
        response.setOrganizer(contest.getOrganizer());
        if (contest.getCategory() != null) {
            response.setCategoryId(contest.getCategory().getId());
            response.setCategoryName(contest.getCategory().getName());
        }
        response.setStartDate(contest.getStartDate());
        response.setEndDate(contest.getEndDate());
        response.setRegistrationDeadline(contest.getRegistrationDeadline());
        response.setStatus(contest.getStatus());
        response.setCreatedAt(contest.getCreatedAt());
        return response;
    }
}