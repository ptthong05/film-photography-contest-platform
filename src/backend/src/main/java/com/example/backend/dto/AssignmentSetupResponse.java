package com.example.backend.dto;

import java.util.List;

/** Dữ liệu để ban tổ chức phân công một cuộc thi: vòng chấm, tiêu chí và các bài đã duyệt. */
public record AssignmentSetupResponse(
        String contestId,
        String contestTitle,
        List<JudgingRoundResponse> rounds,
        List<JudgingCriterionResponse> criteria,
        List<SubmissionSummaryResponse> submissions
) {
}
