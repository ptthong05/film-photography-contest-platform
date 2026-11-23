package com.example.backend.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/** submissionIds đã được bung ra: phân công "toàn bộ bài" (rỗng trong DB) trả về mọi bài VERIFIED của cuộc thi. */
public record AssignmentResponse(
        String id,
        String contestId,
        String contestTitle,
        String roundId,
        String judgeId,
        String judgeName,
        String judgeEmail,
        String judgeSpecialty,
        List<String> submissionIds,
        List<String> reviewedSubmissionIds,
        int remindersSent,
        LocalDate deadline,
        Instant updatedAt
) {
}
