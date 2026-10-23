package com.example.backend.entity.embedded;

/** Điểm của một tiêu chí trong phiếu chấm, nhúng trong evaluations.scores. */
public record CriterionScore(
        String criterionId,
        double score
) {
}
