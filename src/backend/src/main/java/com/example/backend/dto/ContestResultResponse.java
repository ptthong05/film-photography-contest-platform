package com.example.backend.dto;

import com.example.backend.enums.PrizeRank;

import java.time.Instant;

/** Kết quả đã công bố của một bài, ai cũng xem được. */
public record ContestResultResponse(
        int ranking,
        String submissionId,
        String code,
        String title,
        String authorName,
        String category,
        String imageUrl,
        double averageScore,
        PrizeRank prizeRank,
        Instant publishedAt
) {
}
