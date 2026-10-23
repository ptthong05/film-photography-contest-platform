package com.example.backend.entity.embedded;

import java.time.Instant;

/** Một vòng chấm của cuộc thi, nhúng trong contests.rounds. id do backend sinh để phiếu chấm tham chiếu. */
public record JudgingRound(
        String id,
        String name,
        int order,
        Instant startDate,
        Instant endDate
) {
}
