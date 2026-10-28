package com.example.backend.entity;

import com.example.backend.entity.embedded.CriterionScore;
import com.example.backend.enums.EvaluationStatus;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** Phiếu chấm của một giám khảo cho một bài dự thi trong một vòng. */
@CompoundIndex(
        name = "submission_round_judge_unique",
        def = "{'submissionId': 1, 'roundId': 1, 'judgeId': 1}",
        unique = true)
@Document(collection = "evaluations")
public class Evaluation extends BaseDocument {

    /** -> contest_submissions._id */
    private String submissionId;

    /** Lặp lại từ bài dự thi để lọc theo cuộc thi không cần join */
    @Indexed
    private String contestId;

    /** -> contests.rounds.id */
    private String roundId;

    /** -> users._id (role JUDGE) */
    @Indexed
    private String judgeId;

    private List<CriterionScore> scores = new ArrayList<>();

    /** Tổng có trọng số theo contests.criteria */
    private double totalScore;

    /** Nhận xét gửi thí sinh */
    private String comment;

    /** Ghi chú riêng, chỉ giám khảo đó thấy */
    private String privateNote;

    /** Giám khảo đề xuất bài vào vòng tiếp theo */
    private boolean recommendNextRound;

    private EvaluationStatus status = EvaluationStatus.DRAFT;

    private Instant finalizedAt;

    public Evaluation() {
    }

    public String getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(String submissionId) {
        this.submissionId = submissionId;
    }

    public String getContestId() {
        return contestId;
    }

    public void setContestId(String contestId) {
        this.contestId = contestId;
    }

    public String getRoundId() {
        return roundId;
    }

    public void setRoundId(String roundId) {
        this.roundId = roundId;
    }

    public String getJudgeId() {
        return judgeId;
    }

    public void setJudgeId(String judgeId) {
        this.judgeId = judgeId;
    }

    public List<CriterionScore> getScores() {
        return scores;
    }

    public void setScores(List<CriterionScore> scores) {
        this.scores = scores;
    }

    public double getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(double totalScore) {
        this.totalScore = totalScore;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getPrivateNote() {
        return privateNote;
    }

    public void setPrivateNote(String privateNote) {
        this.privateNote = privateNote;
    }

    public boolean isRecommendNextRound() {
        return recommendNextRound;
    }

    public void setRecommendNextRound(boolean recommendNextRound) {
        this.recommendNextRound = recommendNextRound;
    }

    public EvaluationStatus getStatus() {
        return status;
    }

    public void setStatus(EvaluationStatus status) {
        this.status = status;
    }

    public Instant getFinalizedAt() {
        return finalizedAt;
    }

    public void setFinalizedAt(Instant finalizedAt) {
        this.finalizedAt = finalizedAt;
    }
}
