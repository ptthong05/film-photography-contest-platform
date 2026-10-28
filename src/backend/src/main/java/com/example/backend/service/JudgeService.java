package com.example.backend.service;

import com.example.backend.dto.EvaluationHistoryResponse;
import com.example.backend.dto.EvaluationRequest;
import com.example.backend.dto.EvaluationResponse;
import com.example.backend.dto.JudgeContestResponse;
import com.example.backend.dto.JudgeSubmissionResponse;
import com.example.backend.entity.BaseDocument;
import com.example.backend.entity.Contest;
import com.example.backend.entity.Evaluation;
import com.example.backend.entity.JudgeAssignment;
import com.example.backend.entity.Submission;
import com.example.backend.entity.User;
import com.example.backend.entity.embedded.CriterionScore;
import com.example.backend.entity.embedded.JudgingCriterion;
import com.example.backend.entity.embedded.JudgingRound;
import com.example.backend.enums.EvaluationStatus;
import com.example.backend.enums.SubmissionStatus;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ConflictException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ContestRepository;
import com.example.backend.repository.EvaluationRepository;
import com.example.backend.repository.JudgeAssignmentRepository;
import com.example.backend.repository.SubmissionRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
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
    private record AssignedScope(Submission submission, Contest contest, JudgingRound round) {
    }

    private final JudgeAssignmentRepository judgeAssignmentRepository;
    private final ContestRepository contestRepository;
    private final SubmissionRepository submissionRepository;
    private final EvaluationRepository evaluationRepository;
    private final UserRepository userRepository;

    public JudgeService(
            JudgeAssignmentRepository judgeAssignmentRepository,
            ContestRepository contestRepository,
            SubmissionRepository submissionRepository,
            EvaluationRepository evaluationRepository,
            UserRepository userRepository) {
        this.judgeAssignmentRepository = judgeAssignmentRepository;
        this.contestRepository = contestRepository;
        this.submissionRepository = submissionRepository;
        this.evaluationRepository = evaluationRepository;
        this.userRepository = userRepository;
    }

    public List<JudgeSubmissionResponse> getAssignedSubmissions(String judgeId) {
        return toResponses(judgeId, findScopes(judgeId));
    }

    /** Cuộc thi có ít nhất 1 bài trong phạm vi chấm; số liệu chỉ tính trên các bài đó */
    public List<JudgeContestResponse> getAssignedContests(String judgeId) {
        Map<String, Evaluation> evaluationByKey = evaluationsByKey(judgeId);
        Map<String, List<AssignedScope>> scopesByContest = findScopes(judgeId).stream()
                .collect(Collectors.groupingBy(scope -> scope.contest().getId(), LinkedHashMap::new, Collectors.toList()));

        return scopesByContest.values().stream().map(scopes -> {
            Contest contest = scopes.get(0).contest();
            JudgingRound currentRound = scopes.stream()
                    .map(AssignedScope::round)
                    .max(Comparator.comparingInt(JudgingRound::order))
                    .orElseThrow();
            List<Evaluation> evaluations = scopes.stream()
                    .map(scope -> evaluationByKey.get(key(scope.submission().getId(), scope.round().id())))
                    .filter(Objects::nonNull)
                    .toList();
            int evaluatedCount = (int) evaluations.stream()
                    .filter(item -> item.getStatus() == EvaluationStatus.FINALIZED)
                    .count();
            boolean hasDraft = evaluations.stream().anyMatch(item -> item.getStatus() == EvaluationStatus.DRAFT);
            return new JudgeContestResponse(
                    contest.getId(),
                    contest.getTitle(),
                    contest.getCoverUrl(),
                    contest.getJudgingStart(),
                    contest.getJudgingEnd(),
                    progressStatus(scopes.size(), evaluatedCount, hasDraft),
                    currentRound,
                    contest.getCriteria(),
                    scopes.size(),
                    evaluatedCount,
                    contest.getResultPublishedAt() != null);
        }).toList();
    }

    /** Toàn bộ phiếu chấm của giám khảo (trang Kết quả / Thống kê) */
    public List<EvaluationResponse> getEvaluations(String judgeId) {
        return evaluationRepository.findByJudgeId(judgeId).stream().map(EvaluationResponse::fromEntity).toList();
    }

    /** Các phiếu đã chốt của chính giám khảo cho bài này, theo thứ tự vòng */
    public List<EvaluationHistoryResponse> getEvaluationHistory(String judgeId, String submissionId) {
        AssignedScope scope = requireScope(judgeId, submissionId);
        Map<String, JudgingRound> roundById = scope.contest().getRounds().stream()
                .collect(Collectors.toMap(JudgingRound::id, Function.identity()));
        return evaluationRepository
                .findBySubmissionIdAndJudgeIdAndStatus(submissionId, judgeId, EvaluationStatus.FINALIZED).stream()
                .filter(item -> roundById.containsKey(item.getRoundId()))
                .sorted(Comparator.comparingInt(item -> roundById.get(item.getRoundId()).order()))
                .map(item -> new EvaluationHistoryResponse(
                        roundById.get(item.getRoundId()).name(),
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
        return evaluationRepository.findBySubmissionIdAndRoundIdAndJudgeId(submissionId, scope.round().id(), judgeId)
                .map(EvaluationResponse::fromEntity)
                .orElse(null);
    }

    public EvaluationResponse saveEvaluation(String judgeId, String submissionId, EvaluationRequest request) {
        AssignedScope scope = requireScope(judgeId, submissionId);
        Evaluation evaluation = evaluationRepository
                .findBySubmissionIdAndRoundIdAndJudgeId(submissionId, scope.round().id(), judgeId)
                .orElseGet(() -> newEvaluation(scope, judgeId));
        if (evaluation.getStatus() == EvaluationStatus.FINALIZED) {
            throw new ConflictException("Phiếu chấm đã được gửi chính thức, không thể chỉnh sửa");
        }

        List<JudgingCriterion> criteria = scope.contest().getCriteria();
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
        Evaluation saved = evaluationRepository.save(evaluation);

        if (request.isFinal()) {
            updateSubmissionTotalScore(scope.submission());
        }
        return EvaluationResponse.fromEntity(saved);
    }

    /**
     * Điểm tổng quy về thang 10 theo trọng số: Σ(score / maxScore × weight) / Σweight × 10, làm tròn 1 chữ số.
     * Trả về null nếu còn tiêu chí chưa chấm. Cùng công thức với utils/calculateScore.ts ở frontend.
     */
    static Double calculateWeightedScore(List<JudgingCriterion> criteria, List<CriterionScore> scores) {
        double totalWeight = criteria.stream().mapToDouble(JudgingCriterion::weight).sum();
        if (criteria.isEmpty() || totalWeight == 0) {
            return null;
        }
        Map<String, Double> scoreByCriterion = scores.stream()
                .collect(Collectors.toMap(CriterionScore::criterionId, CriterionScore::score, (first, second) -> first));
        double weightedSum = 0;
        for (JudgingCriterion criterion : criteria) {
            Double score = scoreByCriterion.get(criterion.id());
            if (score == null) {
                return null;
            }
            weightedSum += score / criterion.maxScore() * criterion.weight();
        }
        return Math.round(weightedSum / totalWeight * 100) / 10.0;
    }

    private List<AssignedScope> findScopes(String judgeId) {
        List<JudgeAssignment> assignments = judgeAssignmentRepository.findByJudgeId(judgeId);
        if (assignments.isEmpty()) {
            return List.of();
        }
        Set<String> contestIds = assignments.stream().map(JudgeAssignment::getContestId).collect(Collectors.toSet());
        Map<String, Contest> contests = contestRepository.findAllById(contestIds).stream()
                .collect(Collectors.toMap(BaseDocument::getId, Function.identity()));

        // Cùng một bài có thể được phân công ở nhiều vòng: giữ vòng có order lớn nhất (vòng hiện tại)
        Map<String, AssignedScope> scopeBySubmission = new LinkedHashMap<>();
        for (JudgeAssignment assignment : assignments) {
            Contest contest = contests.get(assignment.getContestId());
            Optional<JudgingRound> round = contest == null ? Optional.empty() : contest.getRounds().stream()
                    .filter(item -> item.id().equals(assignment.getRoundId()))
                    .findFirst();
            if (round.isEmpty()) {
                continue;
            }
            for (Submission submission : findAssignedSubmissions(assignment)) {
                AssignedScope scope = new AssignedScope(submission, contest, round.get());
                scopeBySubmission.merge(submission.getId(), scope,
                        (current, candidate) -> candidate.round().order() > current.round().order() ? candidate : current);
            }
        }
        return new ArrayList<>(scopeBySubmission.values());
    }

    private List<Submission> findAssignedSubmissions(JudgeAssignment assignment) {
        if (assignment.getSubmissionIds().isEmpty()) {
            return submissionRepository.findByContestIdAndStatus(assignment.getContestId(), SubmissionStatus.VERIFIED);
        }
        // Lọc lại theo cuộc thi và trạng thái: id bị phân công nhầm hoặc bài đã bị loại vẫn không được chấm
        return submissionRepository.findAllById(assignment.getSubmissionIds()).stream()
                .filter(item -> assignment.getContestId().equals(item.getContestId()))
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
        Set<String> visibleAuthorIds = scopes.stream()
                .filter(scope -> !scope.contest().isAnonymousJudging())
                .map(scope -> scope.submission().getParticipantId())
                .collect(Collectors.toSet());
        Map<String, String> authorNames = userRepository.findAllById(visibleAuthorIds).stream()
                .collect(Collectors.toMap(BaseDocument::getId, User::getName));

        return scopes.stream().map(scope -> {
            Submission submission = scope.submission();
            Evaluation evaluation = evaluationByKey.get(key(submission.getId(), scope.round().id()));
            boolean isFinalized = evaluation != null && evaluation.getStatus() == EvaluationStatus.FINALIZED;
            return new JudgeSubmissionResponse(
                    submission.getId(),
                    scope.contest().getId(),
                    scope.contest().getTitle(),
                    scope.round().id(),
                    scope.round().name(),
                    submission.getTitle(),
                    scope.contest().isAnonymousJudging() ? null : authorNames.get(submission.getParticipantId()),
                    submission.getCategory(),
                    submission.getDescription(),
                    submission.getCreatedAt(),
                    submission.getImageUrls(),
                    submission.getThumbnailUrls(),
                    submission.getNegativeUrls(),
                    submission.getContactSheetUrl(),
                    submission.getMetadata(),
                    evaluation == null ? NOT_STARTED : evaluation.getStatus().name(),
                    isFinalized ? evaluation.getTotalScore() : null,
                    isFinalized ? evaluation.getFinalizedAt() : null);
        }).toList();
    }

    private void validateScores(List<JudgingCriterion> criteria, List<CriterionScore> scores) {
        Map<String, JudgingCriterion> criterionById = criteria.stream()
                .collect(Collectors.toMap(JudgingCriterion::id, Function.identity()));
        Set<String> scoredIds = new HashSet<>();
        for (CriterionScore score : scores) {
            JudgingCriterion criterion = score == null ? null : criterionById.get(score.criterionId());
            if (criterion == null) {
                throw new BadRequestException("Tiêu chí chấm không thuộc cuộc thi này");
            }
            if (!scoredIds.add(criterion.id())) {
                throw new BadRequestException("Tiêu chí \"" + criterion.name() + "\" bị chấm trùng");
            }
            if (score.score() < MIN_SCORE || score.score() > criterion.maxScore()) {
                throw new BadRequestException("Điểm tiêu chí \"" + criterion.name() + "\" phải từ "
                        + formatScore(MIN_SCORE) + " đến " + formatScore(criterion.maxScore()));
            }
            double steps = score.score() / SCORE_STEP;
            if (Math.abs(steps - Math.rint(steps)) > 1e-9) {
                throw new BadRequestException("Điểm tiêu chí \"" + criterion.name() + "\" phải theo bước "
                        + formatScore(SCORE_STEP));
            }
        }
    }

    private void updateSubmissionTotalScore(Submission submission) {
        List<Evaluation> finalized = evaluationRepository.findBySubmissionIdAndStatus(
                submission.getId(), EvaluationStatus.FINALIZED);
        double average = finalized.stream().mapToDouble(Evaluation::getTotalScore).average().orElse(0);
        submission.setTotalScore(finalized.isEmpty() ? null : Math.round(average * 10) / 10.0);
        submissionRepository.save(submission);
    }

    private static Evaluation newEvaluation(AssignedScope scope, String judgeId) {
        Evaluation evaluation = new Evaluation();
        evaluation.setSubmissionId(scope.submission().getId());
        evaluation.setContestId(scope.contest().getId());
        evaluation.setRoundId(scope.round().id());
        evaluation.setJudgeId(judgeId);
        return evaluation;
    }

    private static String key(String submissionId, String roundId) {
        return submissionId + "|" + roundId;
    }

    private static String formatScore(double value) {
        return value == Math.floor(value) ? String.valueOf((long) value) : String.valueOf(value);
    }
}
