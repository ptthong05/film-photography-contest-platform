package com.example.backend.dto;

import com.example.backend.entity.JudgingCriterion;

/** Tiêu chí chấm điểm; khớp kiểu JudgingCriterion ở frontend (types/judge.ts). */
public record JudgingCriterionResponse(
        String id,
        String name,
        String description,
        double maxScore,
        double weight
) {
    public static JudgingCriterionResponse fromEntity(JudgingCriterion criterion) {
        return new JudgingCriterionResponse(
                criterion.getId(),
                criterion.getName(),
                criterion.getDescription(),
                criterion.getMaxScore(),
                criterion.getWeight());
    }
}
