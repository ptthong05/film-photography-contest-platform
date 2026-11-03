package com.example.backend.dto;

public record PublicStatsResponse(
        long contests,
        long ongoingContests,
        long participants,
        long submissions,
        long judges,
        long awards
) {
}
