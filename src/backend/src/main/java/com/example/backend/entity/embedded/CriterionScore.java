package com.example.backend.entity.embedded;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/**
 * Điểm của một tiêu chí trong phiếu chấm.
 * Lưu ở bảng evaluation_scores, đồng thời dùng làm JSON trong request/response.
 */
@Embeddable
public record CriterionScore(
        @Column(name = "criterion_id", nullable = false, length = 36)
        String criterionId,
        @Column(nullable = false)
        double score
) {
}
