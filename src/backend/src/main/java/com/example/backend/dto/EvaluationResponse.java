package com.example.backend.dto;

import com.example.backend.entity.Evaluation;
import com.example.backend.entity.embedded.CriterionScore;
import com.example.backend.enums.EvaluationStatus;

import java.time.Instant;
import java.util.List;

/** Phiếu chấm của giám khảo. totalScore chỉ có khi phiếu đã FINALIZED. */
public record EvaluationResponse(
        String submissionId,
        String roundId,
        List<CriterionScore> scores,
        String comment,
        String privateNote,
        boolean recommendNextRound,
        EvaluationStatus status,
        Double totalScore,
        Instant updatedAt
) {
    public static EvaluationResponse fromEntity(Evaluation evaluation) {
        boolean isFinalized = evaluation.getStatus() == EvaluationStatus.FINALIZED;
        return new EvaluationResponse(
                evaluation.getSubmissionId(),
                evaluation.getRoundId(),
                evaluation.getScores(),
                evaluation.getComment(),
                evaluation.getPrivateNote(),
                evaluation.isRecommendNextRound(),
                evaluation.getStatus(),
                isFinalized ? evaluation.getTotalScore() : null,
                evaluation.getUpdatedAt());
    }
}
