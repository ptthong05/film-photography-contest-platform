package com.example.backend.dto;

import com.example.backend.enums.PrizeRank;

import java.time.Instant;
import java.util.List;

/** Kết quả 1 bài của thí sinh sau khi cuộc thi công bố; chưa công bố thì bài không xuất hiện. */
public record MyResultResponse(
        String submissionId,
        String contestId,
        String contestTitle,
        String title,
        String imageUrl,
        String category,
        int rank,
        int totalRanked,
        double score,
        PrizeRank prizeRank,
        String awardTitle,
        String reward,
        Instant publishedAt,
        List<JudgeFeedback> judgeFeedback,
        List<CriterionAverage> criteria
) {
    public record JudgeFeedback(String judgeName, String comment) {
    }

    public record CriterionAverage(String name, double averageScore, double maxScore) {
    }
}
