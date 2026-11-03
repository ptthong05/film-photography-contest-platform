package com.example.backend.dto;

/** Xếp hạng thí sinh: ưu tiên nhiều giải, rồi điểm trung bình các bài đã chấm. */
public record LeaderboardEntryResponse(
        int rank,
        String participantId,
        String name,
        String avatarUrl,
        long submissionCount,
        long awardCount,
        long firstPrizeCount,
        double averageScore,
        String bestPhotoUrl,
        String bestPhotoTitle
) {
}
