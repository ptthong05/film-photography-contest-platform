package com.example.backend.dto;

import com.example.backend.entity.FilmMetadata;
import com.example.backend.enums.PrizeRank;

import java.time.Instant;

/** Một tác phẩm đạt giải trong kết quả đã công bố, dùng cho Kho dữ liệu. */
public record AwardArchiveResponse(
        String submissionId,
        String code,
        String contestId,
        String contestTitle,
        /** Năm kết thúc cuộc thi; cuộc thi chưa có ngày kết thúc thì lấy năm công bố */
        int year,
        int ranking,
        PrizeRank prizeRank,
        double averageScore,
        String title,
        String authorName,
        String category,
        String imageUrl,
        /** null khi thí sinh chưa khai báo thông số phim */
        FilmMetadata metadata,
        Instant publishedAt
) {
}
