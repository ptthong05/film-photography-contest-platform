package com.example.backend.dto;

import java.time.Instant;

/** Một phiếu chấm đã chốt của giám khảo cho một bài, theo từng vòng. */
public record EvaluationHistoryResponse(
        String roundName,
        double totalScore,
        String comment,
        boolean recommendNextRound,
        Instant evaluatedAt
) {
}
