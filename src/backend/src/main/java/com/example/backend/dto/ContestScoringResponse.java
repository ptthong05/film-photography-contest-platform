package com.example.backend.dto;

import java.time.Instant;
import java.util.List;

/** Bảng tổng hợp điểm của một cuộc thi cho ban tổ chức, xếp theo điểm trung bình giảm dần. */
public record ContestScoringResponse(
        String contestId,
        String contestTitle,
        boolean published,
        Instant publishedAt,
        List<ScoringEntryResponse> entries
) {
}
