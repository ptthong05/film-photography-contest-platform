package com.example.backend.entity.embedded;

/**
 * Một tiêu chí chấm điểm, nhúng trong contests.criteria.
 * weight tính theo %, tổng weight các tiêu chí của một cuộc thi = 100.
 */
public record JudgingCriterion(
        String id,
        String name,
        String description,
        double maxScore,
        double weight
) {
}
