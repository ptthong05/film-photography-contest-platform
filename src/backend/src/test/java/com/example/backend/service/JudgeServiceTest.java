package com.example.backend.service;

import com.example.backend.dto.EvaluationRequest;
import com.example.backend.dto.EvaluationResponse;
import com.example.backend.dto.JudgeContestResponse;
import com.example.backend.dto.JudgeSubmissionResponse;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyIterable;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class JudgeServiceTest {

    private static final String JUDGE_A = "judge-a";
    private static final String JUDGE_B = "judge-b";
    private static final List<JudgingCriterion> CRITERIA = List.of(
            new JudgingCriterion("cr-composition", "Bố cục", "", 10, 60),
            new JudgingCriterion("cr-light", "Ánh sáng", "", 10, 40));

    private JudgeAssignmentRepository judgeAssignmentRepository;
    private ContestRepository contestRepository;
    private SubmissionRepository submissionRepository;
    private EvaluationRepository evaluationRepository;
    private UserRepository userRepository;
    private JudgeService judgeService;

    private Contest publicContest;
    private Contest anonymousContest;
    private Submission verifiedA1;
    private Submission verifiedA2;
    private Submission verifiedB1;
    private Submission verifiedB2;
    private Submission pendingB3;

    @BeforeEach
    void setUp() {
        judgeAssignmentRepository = mock(JudgeAssignmentRepository.class);
        contestRepository = mock(ContestRepository.class);
        submissionRepository = mock(SubmissionRepository.class);
        evaluationRepository = mock(EvaluationRepository.class);
        userRepository = mock(UserRepository.class);
        judgeService = new JudgeService(judgeAssignmentRepository, contestRepository, submissionRepository,
                evaluationRepository, userRepository);

        publicContest = contest("contest-public", false);
        anonymousContest = contest("contest-anonymous", true);
        verifiedA1 = submission("a1", publicContest, SubmissionStatus.VERIFIED);
        verifiedA2 = submission("a2", publicContest, SubmissionStatus.VERIFIED);
        verifiedB1 = submission("b1", anonymousContest, SubmissionStatus.VERIFIED);
        verifiedB2 = submission("b2", anonymousContest, SubmissionStatus.VERIFIED);
        pendingB3 = submission("b3", anonymousContest, SubmissionStatus.PENDING);

        when(contestRepository.findAllById(anyIterable())).thenReturn(List.of(publicContest, anonymousContest));
        when(submissionRepository.findByContestIdAndStatus(publicContest.getId(), SubmissionStatus.VERIFIED))
                .thenReturn(List.of(verifiedA1, verifiedA2));
        when(evaluationRepository.save(any(Evaluation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Judge A: toàn bộ bài VERIFIED của cuộc thi công khai + 2 bài chỉ định ở cuộc thi ẩn danh (1 bài chưa duyệt)
        when(judgeAssignmentRepository.findByJudgeId(JUDGE_A)).thenReturn(List.of(
                assignment(publicContest, JUDGE_A, List.of()),
                assignment(anonymousContest, JUDGE_A, List.of("b1", "b3"))));
        when(submissionRepository.findAllById(List.of("b1", "b3"))).thenReturn(List.of(verifiedB1, pendingB3));
        // Judge B: chỉ bài b2
        when(judgeAssignmentRepository.findByJudgeId(JUDGE_B)).thenReturn(List.of(
                assignment(anonymousContest, JUDGE_B, List.of("b2"))));
        when(submissionRepository.findAllById(List.of("b2"))).thenReturn(List.of(verifiedB2));
    }

    @Test
    void listsOnlyVerifiedSubmissionsInJudgesOwnAssignments() {
        List<String> judgeAIds = judgeService.getAssignedSubmissions(JUDGE_A).stream()
                .map(JudgeSubmissionResponse::id).toList();
        List<String> judgeBIds = judgeService.getAssignedSubmissions(JUDGE_B).stream()
                .map(JudgeSubmissionResponse::id).toList();

        assertThat(judgeAIds).containsExactly("a1", "a2", "b1");
        assertThat(judgeBIds).containsExactly("b2");
    }

    @Test
    void judgeWithoutAssignmentSeesNothing() {
        assertThat(judgeService.getAssignedSubmissions("judge-new")).isEmpty();
        assertThatThrownBy(() -> judgeService.getAssignedSubmission("judge-new", "a1"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void cannotOpenOrScoreSubmissionAssignedToAnotherJudge() {
        assertThatThrownBy(() -> judgeService.getAssignedSubmission(JUDGE_A, "b2"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Không tìm thấy bài dự thi được phân công");
        assertThatThrownBy(() -> judgeService.getEvaluation(JUDGE_A, "b2"))
                .isInstanceOf(ResourceNotFoundException.class);
        assertThatThrownBy(() -> judgeService.saveEvaluation(JUDGE_A, "b2", request(fullScores(), "Tốt", true)))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(evaluationRepository, never()).save(any(Evaluation.class));
    }

    @Test
    void cannotScoreSubmissionThatIsNotVerified() {
        assertThatThrownBy(() -> judgeService.saveEvaluation(JUDGE_A, "b3", request(fullScores(), "Tốt", true)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void anonymousContestHidesAuthorName() {
        User author = new User();
        author.setId("participant-1");
        author.setName("Lê Minh Châu");
        when(userRepository.findAllById(anyIterable())).thenReturn(List.of(author));

        List<JudgeSubmissionResponse> submissions = judgeService.getAssignedSubmissions(JUDGE_A);

        assertThat(submissions).filteredOn(item -> item.id().equals("a1"))
                .singleElement().extracting(JudgeSubmissionResponse::authorName).isEqualTo("Lê Minh Châu");
        assertThat(submissions).filteredOn(item -> item.id().equals("b1"))
                .singleElement().extracting(JudgeSubmissionResponse::authorName).isNull();
    }

    @Test
    void draftMayBeIncompleteButFinalNeedsAllCriteriaAndComment() {
        List<CriterionScore> partial = List.of(new CriterionScore("cr-composition", 8));

        EvaluationResponse draft = judgeService.saveEvaluation(JUDGE_A, "a1", request(partial, "", false));

        assertThat(draft.status()).isEqualTo(EvaluationStatus.DRAFT);
        assertThat(draft.totalScore()).isNull();
        assertThatThrownBy(() -> judgeService.saveEvaluation(JUDGE_A, "a1", request(partial, "Tốt", true)))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Vui lòng chấm đủ tất cả tiêu chí trước khi gửi");
        assertThatThrownBy(() -> judgeService.saveEvaluation(JUDGE_A, "a1", request(fullScores(), "   ", true)))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Vui lòng nhập nhận xét trước khi gửi");
    }

    @Test
    void rejectsInvalidScores() {
        assertThatThrownBy(() -> judgeService.saveEvaluation(JUDGE_A, "a1",
                request(List.of(new CriterionScore("cr-composition", 7.3)), "", false)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("bước 0.5");
        assertThatThrownBy(() -> judgeService.saveEvaluation(JUDGE_A, "a1",
                request(List.of(new CriterionScore("cr-composition", 11)), "", false)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("phải từ 1 đến 10");
        assertThatThrownBy(() -> judgeService.saveEvaluation(JUDGE_A, "a1",
                request(List.of(new CriterionScore("cr-unknown", 5)), "", false)))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Tiêu chí chấm không thuộc cuộc thi này");
        assertThatThrownBy(() -> judgeService.saveEvaluation(JUDGE_A, "a1", request(List.of(
                new CriterionScore("cr-composition", 5), new CriterionScore("cr-composition", 6)), "", false)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("bị chấm trùng");
    }

    @Test
    void finalizedEvaluationIsLocked() {
        Evaluation finalized = new Evaluation();
        finalized.setStatus(EvaluationStatus.FINALIZED);
        when(evaluationRepository.findBySubmissionIdAndRoundIdAndJudgeId("a1", "round-1", JUDGE_A))
                .thenReturn(Optional.of(finalized));

        assertThatThrownBy(() -> judgeService.saveEvaluation(JUDGE_A, "a1", request(fullScores(), "Sửa lại", true)))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void finalizeComputesWeightedScoreAndUpdatesSubmissionAverage() {
        Evaluation otherJudge = new Evaluation();
        otherJudge.setStatus(EvaluationStatus.FINALIZED);
        otherJudge.setTotalScore(7.0);
        when(evaluationRepository.findBySubmissionIdAndStatus("a1", EvaluationStatus.FINALIZED))
                .thenAnswer(invocation -> {
                    Evaluation mine = new Evaluation();
                    mine.setTotalScore(8.4);
                    return List.of(otherJudge, mine);
                });

        // 9 × 60% + 7.5 × 40% = 8.4
        EvaluationResponse response = judgeService.saveEvaluation(JUDGE_A, "a1", request(fullScores(), " Ánh sáng đẹp ", true));

        assertThat(response.status()).isEqualTo(EvaluationStatus.FINALIZED);
        assertThat(response.totalScore()).isEqualTo(8.4);
        assertThat(response.comment()).isEqualTo("Ánh sáng đẹp");
        ArgumentCaptor<Submission> savedSubmission = ArgumentCaptor.forClass(Submission.class);
        verify(submissionRepository).save(savedSubmission.capture());
        assertThat(savedSubmission.getValue().getTotalScore()).isEqualTo(7.7);
    }

    @Test
    void contestsCountOnlySubmissionsInJudgesScope() {
        Evaluation finalized = new Evaluation();
        finalized.setSubmissionId("a1");
        finalized.setRoundId("round-1");
        finalized.setStatus(EvaluationStatus.FINALIZED);
        when(evaluationRepository.findByJudgeId(JUDGE_A)).thenReturn(List.of(finalized));

        List<JudgeContestResponse> contests = judgeService.getAssignedContests(JUDGE_A);

        assertThat(contests).extracting(JudgeContestResponse::id)
                .containsExactly("contest-public", "contest-anonymous");
        assertThat(contests.get(0).assignedCount()).isEqualTo(2);
        assertThat(contests.get(0).evaluatedCount()).isEqualTo(1);
        assertThat(contests.get(0).status()).isEqualTo("JUDGING");
        // Chỉ b1 thuộc phạm vi, b3 chưa duyệt không được tính
        assertThat(contests.get(1).assignedCount()).isEqualTo(1);
        assertThat(contests.get(1).status()).isEqualTo("NOT_STARTED");
        assertThat(judgeService.getAssignedContests("judge-new")).isEmpty();
    }

    @Test
    void historyOfSubmissionOutsideScopeIsNotFound() {
        assertThatThrownBy(() -> judgeService.getEvaluationHistory(JUDGE_A, "b2"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    private static Contest contest(String id, boolean anonymousJudging) {
        Contest contest = new Contest();
        contest.setId(id);
        contest.setTitle(id);
        contest.setAnonymousJudging(anonymousJudging);
        contest.setRounds(List.of(new JudgingRound("round-1", "Vòng sơ khảo", 1, null, null)));
        contest.setCriteria(CRITERIA);
        return contest;
    }

    private static Submission submission(String id, Contest contest, SubmissionStatus status) {
        Submission submission = new Submission();
        submission.setId(id);
        submission.setContestId(contest.getId());
        submission.setParticipantId("participant-1");
        submission.setTitle("Bài " + id);
        submission.setStatus(status);
        return submission;
    }

    private static JudgeAssignment assignment(Contest contest, String judgeId, List<String> submissionIds) {
        JudgeAssignment assignment = new JudgeAssignment();
        assignment.setContestId(contest.getId());
        assignment.setRoundId("round-1");
        assignment.setJudgeId(judgeId);
        assignment.setSubmissionIds(submissionIds);
        return assignment;
    }

    private static List<CriterionScore> fullScores() {
        return List.of(new CriterionScore("cr-composition", 9), new CriterionScore("cr-light", 7.5));
    }

    private static EvaluationRequest request(List<CriterionScore> scores, String comment, boolean isFinal) {
        return new EvaluationRequest(scores, comment, null, false, isFinal);
    }
}
