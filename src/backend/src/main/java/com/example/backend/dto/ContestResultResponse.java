package com.example.backend.dto;

import com.example.backend.enums.PrizeRank;

/** 1 dòng bảng xếp hạng của cuộc thi. award = null khi tác phẩm không đoạt giải. */
public record ContestResultResponse(
        String id,
        int rank,
        String submissionId,
        String submissionTitle,
        String authorName,
        double averageScore,
        PrizeRank award,
        String awardTitle,
        String reward,
        String contestId,
        String contestTitle,
        boolean published,
        String imageUrl,
        String thumbnailUrl,
        String category
) {
}
