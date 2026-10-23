package com.example.backend.entity.embedded;

import java.time.Instant;
import java.util.List;

/** Kết quả AI kiểm tra ảnh trùng lặp / ảnh do AI tạo, nhúng trong bài dự thi. */
public record AiVerification(
        boolean duplicate,
        boolean aiGenerated,
        Double similarityScore,
        String duplicateOfSubmissionId,
        List<String> autoTags,
        Instant checkedAt
) {
}
