package com.example.backend.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.util.ArrayList;
import java.util.List;

/**
 * Ban tổ chức phân công giám khảo chấm một vòng của cuộc thi.
 * submissionIds rỗng = chấm toàn bộ bài hợp lệ của vòng.
 */
@Entity
@Table(
        name = "judge_assignments",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_assignment_contest_round_judge",
                columnNames = {"contest_id", "round_id", "judge_id"}),
        indexes = @Index(name = "idx_assignment_judge", columnList = "judge_id"))
public class JudgeAssignment extends BaseEntity {

    /** -> contests.id */
    @Column(nullable = false)
    private Long contestId;

    /** -> rounds.id */
    @Column(nullable = false)
    private Long roundId;

    /** -> users.id (role JUDGE) */
    @Column(nullable = false, length = 36)
    private String judgeId;

    /** -> users.id của người phân công */
    @Column(length = 36)
    private String assignedBy;

    // EAGER vì danh sách nhỏ và open-in-view=false: service đọc sau khi transaction của repository đã đóng.
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "judge_assignment_submissions",
            joinColumns = @JoinColumn(name = "assignment_id"),
            indexes = @Index(name = "idx_assignment_sub_submission", columnList = "submission_id"))
    @Column(name = "submission_id", nullable = false, length = 36)
    private List<String> submissionIds = new ArrayList<>();

    @Column(nullable = false)
    private int remindersSent;

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

    public String getAssignedBy() {
        return assignedBy;
    }

    public void setAssignedBy(String assignedBy) {
        this.assignedBy = assignedBy;
    }

    public List<String> getSubmissionIds() {
        return submissionIds;
    }

    public void setSubmissionIds(List<String> submissionIds) {
        this.submissionIds = submissionIds;
    }

    public int getRemindersSent() {
        return remindersSent;
    }

    public void setRemindersSent(int remindersSent) {
        this.remindersSent = remindersSent;
    }
}
