package com.example.backend.entity;

import com.example.backend.enums.PrizeRank;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;

/**
 * Kết quả chính thức của một bài khi ban tổ chức công bố cuộc thi.
 * Điểm và thứ hạng được chụp lại tại thời điểm công bố để kết quả không đổi khi dữ liệu chấm thay đổi sau đó.
 */
@Entity
@Table(
        name = "contest_results",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_result_contest_submission",
                columnNames = {"contest_id", "submission_id"}),
        indexes = @Index(name = "idx_result_contest", columnList = "contest_id"))
public class ContestResult extends BaseEntity {

    /** -> contests.id */
    @Column(nullable = false)
    private Long contestId;

    /** -> submissions.id */
    @Column(nullable = false, length = 36)
    private String submissionId;

    /** Thứ hạng theo điểm trung bình, bắt đầu từ 1 */
    @Column(nullable = false)
    private int ranking;

    @Column(nullable = false)
    private double averageScore;

    /** null = không đạt giải */
    @Enumerated(EnumType.STRING)
    @Column(length = 16)
    private PrizeRank prizeRank;

    /** -> users.id của người công bố */
    @Column(nullable = false, length = 36)
    private String publishedBy;

    @Column(nullable = false)
    private Instant publishedAt;

    public Long getContestId() {
        return contestId;
    }

    public void setContestId(Long contestId) {
        this.contestId = contestId;
    }

    public String getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(String submissionId) {
        this.submissionId = submissionId;
    }

    public int getRanking() {
        return ranking;
    }

    public void setRanking(int ranking) {
        this.ranking = ranking;
    }

    public double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(double averageScore) {
        this.averageScore = averageScore;
    }

    public PrizeRank getPrizeRank() {
        return prizeRank;
    }

    public void setPrizeRank(PrizeRank prizeRank) {
        this.prizeRank = prizeRank;
    }

    public String getPublishedBy() {
        return publishedBy;
    }

    public void setPublishedBy(String publishedBy) {
        this.publishedBy = publishedBy;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(Instant publishedAt) {
        this.publishedAt = publishedAt;
    }
}
