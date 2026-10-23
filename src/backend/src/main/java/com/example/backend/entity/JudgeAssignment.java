package com.example.backend.entity;

import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

/** Ban tổ chức phân công giám khảo chấm một cuộc thi (theo vòng). submissionIds rỗng = chấm toàn bộ bài của vòng. */
@CompoundIndex(name = "contest_round_judge_unique", def = "{'contestId': 1, 'roundId': 1, 'judgeId': 1}", unique = true)
@Document(collection = "judge_assignments")
public class JudgeAssignment extends BaseDocument {

    /** -> contests._id */
    private String contestId;

    /** -> contests.rounds.id */
    private String roundId;

    /** -> users._id (role JUDGE) */
    @Indexed
    private String judgeId;

    /** -> users._id của người phân công */
    private String assignedBy;

    private List<String> submissionIds = new ArrayList<>();

    public JudgeAssignment() {
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
}
