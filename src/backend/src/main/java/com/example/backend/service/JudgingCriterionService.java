package com.example.backend.service;

import com.example.backend.dto.JudgingCriteriaRequest;
import com.example.backend.dto.JudgingCriterionRequest;
import com.example.backend.dto.JudgingCriterionResponse;
import com.example.backend.entity.JudgingCriterion;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ConflictException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ContestRepository;
import com.example.backend.repository.EvaluationRepository;
import com.example.backend.repository.JudgingCriterionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.IntStream;

/** Bộ tiêu chí chấm điểm của từng cuộc thi, do ban tổ chức cấu hình. */
@Service
public class JudgingCriterionService {

    private static final double TOTAL_WEIGHT = 100;
    private static final double WEIGHT_TOLERANCE = 0.01;

    private final JudgingCriterionRepository criterionRepository;
    private final ContestRepository contestRepository;
    private final EvaluationRepository evaluationRepository;

    public JudgingCriterionService(
            JudgingCriterionRepository criterionRepository,
            ContestRepository contestRepository,
            EvaluationRepository evaluationRepository) {
        this.criterionRepository = criterionRepository;
        this.contestRepository = contestRepository;
        this.evaluationRepository = evaluationRepository;
    }

    public List<JudgingCriterionResponse> getByContest(Long contestId) {
        requireContest(contestId);
        return criterionRepository.findByContestIdOrderByDisplayOrderAsc(contestId).stream()
                .map(JudgingCriterionResponse::fromEntity)
                .toList();
    }

    /**
     * Thay toàn bộ tiêu chí. Bị chặn khi cuộc thi đã có phiếu chấm vì phiếu lưu điểm theo id tiêu chí:
     * thay tiêu chí sẽ làm điểm cũ mất nghĩa.
     */
    @Transactional
    public List<JudgingCriterionResponse> replace(Long contestId, JudgingCriteriaRequest request) {
        requireContest(contestId);
        if (!evaluationRepository.findByContestId(contestId).isEmpty()) {
            throw new ConflictException("Cuộc thi đã có phiếu chấm, không thể thay đổi tiêu chí");
        }
        List<JudgingCriterionRequest> items = request.criteria();
        validate(items);

        criterionRepository.deleteByContestId(contestId);
        // Flush để lệnh xoá chạy trước insert, tránh trùng unique (contest_id, name) khi giữ lại tên cũ
        criterionRepository.flush();
        List<JudgingCriterion> created = IntStream.range(0, items.size())
                .mapToObj(index -> toEntity(contestId, items.get(index), index))
                .toList();
        return criterionRepository.saveAll(created).stream()
                .map(JudgingCriterionResponse::fromEntity)
                .toList();
    }

    private static void validate(List<JudgingCriterionRequest> items) {
        Set<String> names = new HashSet<>();
        for (JudgingCriterionRequest item : items) {
            if (!names.add(item.name().trim().toLowerCase(Locale.ROOT))) {
                throw new BadRequestException("Tiêu chí \"" + item.name().trim() + "\" bị trùng tên");
            }
        }
        double totalWeight = items.stream().mapToDouble(JudgingCriterionRequest::weight).sum();
        if (Math.abs(totalWeight - TOTAL_WEIGHT) > WEIGHT_TOLERANCE) {
            throw new BadRequestException("Tổng trọng số các tiêu chí phải bằng 100%");
        }
    }

    private static JudgingCriterion toEntity(Long contestId, JudgingCriterionRequest item, int order) {
        JudgingCriterion criterion = new JudgingCriterion();
        criterion.setContestId(contestId);
        criterion.setName(item.name().trim());
        criterion.setDescription(item.description() == null ? null : item.description().trim());
        criterion.setMaxScore(item.maxScore());
        criterion.setWeight(item.weight());
        criterion.setDisplayOrder(order);
        return criterion;
    }

    private void requireContest(Long contestId) {
        if (!contestRepository.existsById(contestId)) {
            throw new ResourceNotFoundException("Không tìm thấy cuộc thi");
        }
    }
}
