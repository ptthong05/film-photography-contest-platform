package com.example.backend.service;

import com.example.backend.dto.EvaluationHistoryResponse;
import com.example.backend.dto.EvaluationRequest;
import com.example.backend.dto.EvaluationResponse;
import com.example.backend.dto.JudgeContestResponse;
import com.example.backend.dto.JudgeSubmissionResponse;
import com.example.backend.dto.JudgingCriterionResponse;
import com.example.backend.dto.JudgingRoundResponse;
import com.example.backend.entity.Contest;
import com.example.backend.entity.Evaluation;
import com.example.backend.entity.JudgeAssignment;
import com.example.backend.entity.JudgingCriterion;
import com.example.backend.entity.Round;
import com.example.backend.entity.Submission;
import com.example.backend.entity.embedded.CriterionScore;
import com.example.backend.enums.EvaluationStatus;
import com.example.backend.enums.SubmissionStatus;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ConflictException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ContestRepository;
import com.example.backend.repository.ContestResultRepository;
import com.example.backend.repository.EvaluationRepository;
import com.example.backend.repository.JudgeAssignmentRepository;
import com.example.backend.repository.JudgingCriterionRepository;
import com.example.backend.repository.RoundRepository;
import com.example.backend.repository.SubmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Nghiệp vụ chấm thi của giám khảo. Mọi thao tác đều đi qua findScopes(): giám khảo chỉ thấy và chỉ chấm được
 * bài VERIFIED nằm trong judge_assignments của chính mình (submissionIds rỗng = toàn bộ bài VERIFIED của cuộc thi).
 * Bài ngoài phạm vi trả 404 thay vì 403 để không lộ bài đó có tồn tại.
 */
@Service
public class JudgeService {

    static final String NOT_STARTED = "NOT_STARTED";
    static final double MIN_SCORE = 1;
    static final double SCORE_STEP = 0.5;
    private static final String NOT_ASSIGNED_MESSAGE = "Không tìm thấy bài dự thi được phân công";

    /** Một bài dự thi trong phạm vi chấm, kèm cuộc thi và vòng được phân công */
    private record AssignedScope(Submission submission, Contest contest, Round round) {
    }

    private final JudgeAssignmentRepository judgeAssignmentRepository;
    private final ContestRepository contestRepository;
    private final RoundRepository roundRepository;
    private final SubmissionRepository submissionRepository;
    private final EvaluationRepository evaluationRepository;
    private final JudgingCriterionRepository criterionRepository;
    private final ContestResultRepository resultRepository;

    public JudgeService(
            JudgeAssignmentRepository judgeAssignmentRepository,
            ContestRepository contestRepository,
            RoundRepository roundRepository,
            SubmissionRepository submissionRepository,
            EvaluationRepository evaluationRepository,
            JudgingCriterionRepository criterionRepository,
            ContestResultRepository resultRepository) {
        this.judgeAssignmentRepository = judgeAssignmentRepository;
        this.contestRepository = contestRepository;
        this.roundRepository = roundRepository;
        this.submissionRepository = submissionRepository;
        this.evaluationRepository = evaluationRepository;
        this.criterionRepository = criterionRepository;
        this.resultRepository = resultRepository;
    }

    public List<JudgeSubmissionResponse> getAssignedSubmissions(String judgeId) {
        return toResponses(judgeId, findScopes(judgeId));
    }

    /** Cuộc thi có ít nhất 1 bài trong phạm vi chấm; số liệu chỉ tính trên các bài đó */
    public List<JudgeContestResponse> getAssignedContests(String judgeId) {
        Map<String, Evaluation> evaluationByKey = evaluationsByKey(judgeId);
        Map<Long, List<AssignedScope>> scopesByContest = findScopes(judgeId).stream()
                .collect(Collectors.groupingBy(
                        scope -> scope.contest().getId(), LinkedHashMap::new, Collectors.toList()));
        Map<Long, List<JudgingCriterion>> criteriaByContest = criterionRepository
                .findByContestIdIn(scopesByContest.keySet()).stream()
                .sorted(Comparator.comparingInt(JudgingCriterion::getDisplayOrder))
                .collect(Collectors.groupingBy(JudgingCriterion::getContestId));

        return scopesByContest.values().stream().map(scopes -> {
            Contest contest = scopes.get(0).contest();
            Round currentRound = scopes.stream()
                    .map(AssignedScope::round)
                    .max(Comparator.comparingInt(JudgeService::order))
                    .orElseThrow();
            List<Evaluation> evaluations = scopes.stream()
                    .map(scope -> evaluationByKey.get(key(scope.submission().getId(), scope.round().getId())))
                    .filter(Objects::nonNull)
                    .toList();
            int evaluatedCount = (int) evaluations.stream()
                    .filter(item -> item.getStatus() == EvaluationStatus.FINALIZED)
                    .count();
            boolean hasDraft = evaluations.stream().anyMatch(item -> item.getStatus() == EvaluationStatus.DRAFT);
            return new JudgeContestResponse(
                    String.valueOf(contest.getId()),
                    contest.getTitle(),
                    contest.getBannerUrl(),
                    currentRound.getStartDate(),
                    currentRound.getEndDate(),
                    progressStatus(scopes.size(), evaluatedCount, hasDraft),
                    JudgingRoundResponse.fromEntity(currentRound),
                    criteriaByContest.getOrDefault(contest.getId(), List.of()).stream()
                            .map(JudgingCriterionResponse::fromEntity)
                            .toList(),
                    scopes.size(),
                    evaluatedCount,
                    resultRepository.existsByContestId(contest.getId()));
        }).toList();
    }

    /** Toàn bộ phiếu chấm của giám khảo (trang Kết quả / Thống kê) */
    public List<EvaluationResponse> getEvaluations(String judgeId) {
        return evaluationRepository.findByJudgeId(judgeId).stream().map(EvaluationResponse::fromEntity).toList();
    }

    /** Các phiếu đã chốt của chính giám khảo cho bài này, theo thứ tự vòng */
    public List<EvaluationHistoryResponse> getEvaluationHistory(String judgeId, String submissionId) {
        AssignedScope scope = requireScope(judgeId, submissionId);
        Map<Long, Round> roundById = roundRepository.findByContestIdOrderByRoundOrderAsc(scope.contest().getId())
                .stream()
                .collect(Collectors.toMap(Round::getId, Function.identity()));
        return evaluationRepository
                .findBySubmissionIdAndJudgeIdAndStatus(submissionId, judgeId, EvaluationStatus.FINALIZED).stream()
                .filter(item -> roundById.containsKey(item.getRoundId()))
                .sorted(Comparator.comparingInt(item -> order(roundById.get(item.getRoundId()))))
                .map(item -> new EvaluationHistoryResponse(
                        roundById.get(item.getRoundId()).getName(),
                        item.getTotalScore(),
                        item.getComment(),
                        item.isRecommendNextRound(),
                        item.getFinalizedAt()))
                .toList();
    }

    public JudgeSubmissionResponse getAssignedSubmission(String judgeId, String submissionId) {
        return toResponses(judgeId, List.of(requireScope(judgeId, submissionId))).get(0);
    }

    /** null khi giám khảo chưa chấm bài này ở vòng được phân công */
    public EvaluationResponse getEvaluation(String judgeId, String submissionId) {
        AssignedScope scope = requireScope(judgeId, submissionId);
        return evaluationRepository
                .findBySubmissionIdAndRoundIdAndJudgeId(submissionId, scope.round().getId(), judgeId)
                .map(EvaluationResponse::fromEntity)
                .orElse(null);
    }

    @Transactional
    public EvaluationResponse saveEvaluation(String judgeId, String submissionId, EvaluationRequest request) {
        AssignedScope scope = requireScope(judgeId, submissionId);
        Evaluation evaluation = evaluationRepository
                .findBySubmissionIdAndRoundIdAndJudgeId(submissionId, scope.round().getId(), judgeId)
                .orElseGet(() -> newEvaluation(scope, judgeId));
        if (evaluation.getStatus() == EvaluationStatus.FINALIZED) {
            throw new ConflictException("Phiếu chấm đã được gửi chính thức, không thể chỉnh sửa");
        }
        // Kết quả đã chụp điểm lúc công bố; cho chấm tiếp sẽ làm phiếu lệch với kết quả chính thức
        if (resultRepository.existsByContestId(scope.contest().getId())) {
            throw new ConflictException("Cuộc thi đã công bố kết quả, không thể chấm thêm");
        }
        // Giao diện đã khoá ô chấm khi hết hạn; kiểm tra lại ở server để không gọi thẳng API vượt hạn được
        LocalDateTime roundEnd = scope.round().getEndDate();
        if (roundEnd != null && LocalDateTime.now().isAfter(roundEnd)) {
            throw new BadRequestException("Đã hết thời hạn chấm điểm cho vòng thi này");
        }

        List<JudgingCriterion> criteria = criterionRepository
                .findByContestIdOrderByDisplayOrderAsc(scope.contest().getId());
        if (criteria.isEmpty()) {
            throw new BadRequestException("Cuộc thi chưa có tiêu chí chấm điểm, vui lòng liên hệ ban tổ chức");
        }
        validateScores(criteria, request.scores());
        Double totalScore = calculateWeightedScore(criteria, request.scores());
        String comment = request.comment() == null ? "" : request.comment().trim();
        if (request.isFinal() && totalScore == null) {
            throw new BadRequestException("Vui lòng chấm đủ tất cả tiêu chí trước khi gửi");
        }
        if (request.isFinal() && comment.isEmpty()) {
            throw new BadRequestException("Vui lòng nhập nhận xét trước khi gửi");
        }

        evaluation.setScores(new ArrayList<>(request.scores()));
        evaluation.setComment(comment);
        evaluation.setPrivateNote(request.privateNote() == null ? null : request.privateNote().trim());
        evaluation.setRecommendNextRound(request.recommendNextRound());
        // Nháp thiếu tiêu chí thì chưa có tổng điểm; response ẩn totalScore khi phiếu chưa FINALIZED
        evaluation.setTotalScore(totalScore == null ? 0 : totalScore);
        if (request.isFinal()) {
            evaluation.setStatus(EvaluationStatus.FINALIZED);
            evaluation.setFinalizedAt(Instant.now());
        }
        // Flush để @PreUpdate cập nhật updatedAt trước khi trả về
        return EvaluationResponse.fromEntity(evaluationRepository.saveAndFlush(evaluation));
    }

    /**
     * Điểm tổng quy về thang 10 theo trọng số: Σ(score / maxScore × weight) / Σweight × 10, làm tròn 1 chữ số.
     * Trả về null nếu còn tiêu chí chưa chấm. Cùng công thức với utils/calculateScore.ts ở frontend.
     */
    static Double calculateWeightedScore(List<JudgingCriterion> criteria, List<CriterionScore> scores) {
        double totalWeight = criteria.stream().mapToDouble(JudgingCriterion::getWeight).sum();
        if (criteria.isEmpty() || totalWeight == 0) {
            return null;
        }
        Map<String, Double> scoreByCriterion = scores.stream()
                .collect(Collectors.toMap(
                        CriterionScore::criterionId, CriterionScore::score, (first, second) -> first));
        double weightedSum = 0;
        for (JudgingCriterion criterion : criteria) {
            Double score = scoreByCriterion.get(criterion.getId());
            if (score == null) {
                return null;
            }
            weightedSum += score / criterion.getMaxScore() * criterion.getWeight();
        }
        return Math.round(weightedSum / totalWeight * 100) / 10.0;
    }

    private List<AssignedScope> findScopes(String judgeId) {
        List<JudgeAssignment> assignments = judgeAssignmentRepository.findByJudgeId(judgeId);
        if (assignments.isEmpty()) {
            return List.of();
        }
        Map<Long, Contest> contests = contestRepository
                .findAllById(assignments.stream().map(JudgeAssignment::getContestId).collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(Contest::getId, Function.identity()));
        Map<Long, Round> rounds = roundRepository
                .findAllById(assignments.stream().map(JudgeAssignment::getRoundId).collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(Round::getId, Function.identity()));

        // Cùng một bài có thể được phân công ở nhiều vòng: giữ vòng có order lớn nhất (vòng hiện tại)
        Map<String, AssignedScope> scopeBySubmission = new LinkedHashMap<>();
        for (JudgeAssignment assignment : assignments) {
            Contest contest = contests.get(assignment.getContestId());
            Round round = rounds.get(assignment.getRoundId());
            // Cuộc thi hoặc vòng đã bị xoá sau khi phân công: bỏ qua thay vì lỗi cả danh sách
            if (contest == null || round == null) {
                continue;
            }
            for (Submission submission : findAssignedSubmissions(assignment)) {
                AssignedScope scope = new AssignedScope(submission, contest, round);
                scopeBySubmission.merge(submission.getId(), scope, (current, candidate) ->
                        order(candidate.round()) > order(current.round()) ? candidate : current);
            }
        }
        return new ArrayList<>(scopeBySubmission.values());
    }

    private List<Submission> findAssignedSubmissions(JudgeAssignment assignment) {
        // submissions.contest_id của tv3 lưu dạng chuỗi trong khi contests.id là số
        String contestId = String.valueOf(assignment.getContestId());
        if (assignment.getSubmissionIds().isEmpty()) {
            return submissionRepository.findByContestIdAndStatus(contestId, SubmissionStatus.VERIFIED);
        }
        // Lọc lại theo cuộc thi và trạng thái: id bị phân công nhầm hoặc bài đã bị loại vẫn không được chấm
        return submissionRepository.findAllById(assignment.getSubmissionIds()).stream()
                .filter(item -> contestId.equals(item.getContestId()))
                .filter(item -> item.getStatus() == SubmissionStatus.VERIFIED)
                .toList();
    }

    private AssignedScope requireScope(String judgeId, String submissionId) {
        return findScopes(judgeId).stream()
                .filter(scope -> scope.submission().getId().equals(submissionId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(NOT_ASSIGNED_MESSAGE));
    }

    private Map<String, Evaluation> evaluationsByKey(String judgeId) {
        return evaluationRepository.findByJudgeId(judgeId).stream()
                .collect(Collectors.toMap(item -> key(item.getSubmissionId(), item.getRoundId()), Function.identity(),
                        (first, second) -> first));
    }

    /** Tiến độ chấm của giám khảo trong 1 cuộc thi, khớp JudgeContestStatus ở frontend */
    static String progressStatus(int assignedCount, int evaluatedCount, boolean hasDraft) {
        if (assignedCount > 0 && evaluatedCount == assignedCount) {
            return "COMPLETED";
        }
        return evaluatedCount > 0 || hasDraft ? "JUDGING" : NOT_STARTED;
    }

    private List<JudgeSubmissionResponse> toResponses(String judgeId, List<AssignedScope> scopes) {
        Map<String, Evaluation> evaluationByKey = evaluationsByKey(judgeId);
        return scopes.stream().map(scope -> {
            Submission submission = scope.submission();
            Evaluation evaluation = evaluationByKey.get(key(submission.getId(), scope.round().getId()));
            boolean isFinalized = evaluation != null && evaluation.getStatus() == EvaluationStatus.FINALIZED;
            return new JudgeSubmissionResponse(
                    submission.getId(),
                    String.valueOf(scope.contest().getId()),
                    scope.contest().getTitle(),
                    String.valueOf(scope.round().getId()),
                    scope.round().getName(),
                    submission.getTitle(),
                    // Luôn chấm ẩn danh: Contest chưa có cờ bật/tắt, giấu tên tác giả để chấm khách quan
                    null,
                    submission.getCategory(),
                    submission.getDescription(),
                    submission.getCreatedAt(),
                    // Bài của tv3 chỉ có 1 ảnh scan + 1 ảnh negative; giữ dạng list cho khớp frontend
                    List.of(submission.getImageUrl()),
                    List.of(submission.getImageUrl()),
                    submission.getNegativeUrl() == null ? List.of() : List.of(submission.getNegativeUrl()),
                    null,
                    submission.getMetadata(),
                    evaluation == null ? NOT_STARTED : evaluation.getStatus().name(),
                    isFinalized ? evaluation.getTotalScore() : null,
                    isFinalized ? evaluation.getFinalizedAt() : null);
        }).toList();
    }

    private void validateScores(List<JudgingCriterion> criteria, List<CriterionScore> scores) {
        Map<String, JudgingCriterion> criterionById = criteria.stream()
                .collect(Collectors.toMap(JudgingCriterion::getId, Function.identity()));
        Set<String> scoredIds = new HashSet<>();
        for (CriterionScore score : scores) {
            JudgingCriterion criterion = score == null ? null : criterionById.get(score.criterionId());
            if (criterion == null) {
                throw new BadRequestException("Tiêu chí chấm không thuộc cuộc thi này");
            }
            if (!scoredIds.add(criterion.getId())) {
                throw new BadRequestException("Tiêu chí \"" + criterion.getName() + "\" bị chấm trùng");
            }
            if (score.score() < MIN_SCORE || score.score() > criterion.getMaxScore()) {
                throw new BadRequestException("Điểm tiêu chí \"" + criterion.getName() + "\" phải từ "
                        + formatScore(MIN_SCORE) + " đến " + formatScore(criterion.getMaxScore()));
            }
            double steps = score.score() / SCORE_STEP;
            if (Math.abs(steps - Math.rint(steps)) > 1e-9) {
                throw new BadRequestException("Điểm tiêu chí \"" + criterion.getName() + "\" phải theo bước "
                        + formatScore(SCORE_STEP));
            }
        }
    }

    private static Evaluation newEvaluation(AssignedScope scope, String judgeId) {
        Evaluation evaluation = new Evaluation();
        evaluation.setSubmissionId(scope.submission().getId());
        evaluation.setContestId(scope.contest().getId());
        evaluation.setRoundId(scope.round().getId());
        evaluation.setJudgeId(judgeId);
        return evaluation;
    }

    static int order(Round round) {
        return round.getRoundOrder() == null ? 1 : round.getRoundOrder();
    }

    private static String key(String submissionId, Long roundId) {
        return submissionId + "|" + roundId;
    }

    private static String formatScore(double value) {
        return value == Math.floor(value) ? String.valueOf((long) value) : String.valueOf(value);
    }
}
