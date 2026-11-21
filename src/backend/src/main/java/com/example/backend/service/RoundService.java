package com.example.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.backend.dto.RoundRequest;
import com.example.backend.dto.RoundResponse;
import com.example.backend.entity.Contest;
import com.example.backend.entity.Round;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ContestRepository;
import com.example.backend.repository.RoundRepository;

@Service
public class RoundService {

    private final RoundRepository roundRepository;
    private final ContestRepository contestRepository;

    public RoundService(RoundRepository roundRepository, ContestRepository contestRepository) {
        this.roundRepository = roundRepository;
        this.contestRepository = contestRepository;
    }

    public List<RoundResponse> getRoundsByContestId(Long contestId) {
        if (!contestRepository.existsById(contestId)) {
            throw new ResourceNotFoundException("Không tìm thấy cuộc thi với id: " + contestId);
        }
        return roundRepository.findByContestIdOrderByRoundOrderAsc(contestId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public RoundResponse getRoundById(Long id) {
        Round round = roundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vòng thi với id: " + id));
        return toResponse(round);
    }

    public RoundResponse createRound(RoundRequest request) {
        Contest contest = contestRepository.findById(request.getContestId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc thi với id: " + request.getContestId()));

        validateRoundDates(request, contest);

        if (roundRepository.existsByContestIdAndRoundOrder(contest.getId(), request.getRoundOrder())) {
            throw new DuplicateResourceException("Cuộc thi này đã tồn tại vòng thi số " + request.getRoundOrder());
        }

        Round round = new Round();
        round.setContest(contest);
        round.setName(request.getName().trim());
        round.setRoundOrder(request.getRoundOrder());
        round.setStartDate(request.getStartDate());
        round.setEndDate(request.getEndDate());
        round.setDescription(request.getDescription());

        Round saved = roundRepository.save(round);
        return toResponse(saved);
    }

    public RoundResponse updateRound(Long id, RoundRequest request) {
        Round round = roundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vòng thi với id: " + id));

        Contest contest = contestRepository.findById(request.getContestId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc thi với id: " + request.getContestId()));

        validateRoundDates(request, contest);

        boolean isSameContest = round.getContest().getId().equals(contest.getId());
        boolean isSameOrder = round.getRoundOrder().equals(request.getRoundOrder());
        if ((!isSameContest || !isSameOrder)
                && roundRepository.existsByContestIdAndRoundOrder(contest.getId(), request.getRoundOrder())) {
            throw new DuplicateResourceException("Cuộc thi này đã tồn tại vòng thi số " + request.getRoundOrder());
        }

        round.setContest(contest);
        round.setName(request.getName().trim());
        round.setRoundOrder(request.getRoundOrder());
        round.setStartDate(request.getStartDate());
        round.setEndDate(request.getEndDate());
        round.setDescription(request.getDescription());

        Round updated = roundRepository.save(round);
        return toResponse(updated);
    }

    public void deleteRound(Long id) {
        Round round = roundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vòng thi với id: " + id));
        roundRepository.delete(round);
    }

    private void validateRoundDates(RoundRequest request, Contest contest) {
        if (request.getEndDate().isBefore(request.getStartDate())
                || request.getEndDate().isEqual(request.getStartDate())) {
            throw new IllegalArgumentException("Thời gian kết thúc vòng thi phải sau thời gian bắt đầu");
        }
        if (request.getStartDate().isBefore(contest.getStartDate())
                || request.getEndDate().isAfter(contest.getEndDate())) {
            throw new IllegalArgumentException("Thời gian của vòng thi phải nằm trong khoảng thời gian diễn ra cuộc thi");
        }
    }

    private RoundResponse toResponse(Round round) {
        RoundResponse response = new RoundResponse();
        response.setId(round.getId());
        response.setContestId(round.getContest().getId());
        response.setContestTitle(round.getContest().getTitle());
        response.setName(round.getName());
        response.setRoundOrder(round.getRoundOrder());
        response.setStartDate(round.getStartDate());
        response.setEndDate(round.getEndDate());
        response.setDescription(round.getDescription());
        response.setCreatedAt(round.getCreatedAt());
        return response;
    }
}