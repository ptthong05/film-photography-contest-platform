package com.example.backend.entity;

import com.example.backend.entity.embedded.CriterionScore;
import com.example.backend.enums.EvaluationStatus;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** Phiếu chấm của một giám khảo cho một bài dự thi trong một vòng. */
@Entity
@Table(
        name = "evaluations",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_evaluation_submission_round_judge",
                columnNames = {"submission_id", "round_id", "judge_id"}),
        indexes = {
                @Index(name = "idx_evaluation_judge_status", columnList = "judge_id, status"),
                @Index(name = "idx_evaluation_contest", columnList = "contest_id")
        })
public class Evaluation extends BaseEntity {

    /** -> submissions.id */
    @Column(nullable = false, length = 36)
    private String submissionId;

    /** Lặp lại từ bài dự thi để lọc theo cuộc thi không cần join */
    @Column(nullable = false)
    private Long contestId;

    /** -> rounds.id */
    @Column(nullable = false)
    private Long roundId;

    /** -> users.id (role JUDGE) */
    @Column(nullable = false, length = 36)
    private String judgeId;

    // EAGER vì mỗi phiếu chỉ có vài tiêu chí và open-in-view=false.
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "evaluation_scores", joinColumns = @JoinColumn(name = "evaluation_id"))
    private List<CriterionScore> scores = new ArrayList<>();

    /** Tổng có trọng số theo judging_criteria */
    @Column(nullable = false)
    private double totalScore;

    /** Nhận xét gửi thí sinh */
    @Column(length = 1000)
    private String comment;

    /** Ghi chú riêng, chỉ giám khảo đó thấy */
    @Column(length = 1000)
    private String privateNote;

    /** Giám khảo đề xuất bài vào vòng tiếp theo */
    @Column(nullable = false)
    private boolean recommendNextRound;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private EvaluationStatus status = EvaluationStatus.DRAFT;

    private Instant finalizedAt;

    public String getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(String submissionId) {
        this.submissionId = submissionId;
    }

    public Long getContestId() {
        return contestId;
    }

    public void setContestId(Long contestId) {
        this.contestId = contestId;
    }

    public Long getRoundId() {
        return roundId;
    }

    public void setRoundId(Long roundId) {
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
