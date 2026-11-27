package com.example.backend.dto;

import com.example.backend.enums.PrizeRank;

import java.util.List;

/**
 * Một bài trong bảng tổng hợp điểm. averageScore là trung bình các phiếu đã chốt ở vòng muộn nhất có phiếu;
 * null khi chưa có phiếu nào. ranking/prizeRank chỉ có sau khi công bố.
 */
public record ScoringEntryResponse(
        SubmissionSummaryResponse submission,
        String authorName,
        String roundId,
        String roundName,
        int assignedJudgeCount,
        int finalizedCount,
        Double averageScore,
        List<JudgeScoreResponse> judgeScores,
        Integer ranking,
        PrizeRank prizeRank
) {
}
