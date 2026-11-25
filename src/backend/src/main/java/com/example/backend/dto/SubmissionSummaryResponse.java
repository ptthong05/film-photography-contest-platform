package com.example.backend.dto;

import com.example.backend.entity.FilmMetadata;
import com.example.backend.entity.Submission;

import java.time.Instant;

/** Thông tin rút gọn của bài dự thi cho màn hình phân công và tổng hợp điểm của ban tổ chức. */
public record SubmissionSummaryResponse(
        String id,
        String code,
        String title,
        String category,
        String imageUrl,
        Instant submittedAt,
        String filmStock,
        String camera
) {
    public static SubmissionSummaryResponse fromEntity(Submission submission) {
        FilmMetadata metadata = submission.getMetadata();
        return new SubmissionSummaryResponse(
                submission.getId(),
                // Cùng quy ước mã bài với SubmissionResponse của tv3
                "SUB-" + submission.getId().substring(0, 8),
                submission.getTitle(),
                submission.getCategory(),
                submission.getImageUrl(),
                submission.getCreatedAt(),
                metadata == null ? null : joinFilmStock(metadata.getFilmBrand(), metadata.getFilmStock()),
                metadata == null ? null : metadata.getCamera());
    }

    private static String joinFilmStock(String brand, String stock) {
        if (brand == null || brand.isBlank()) {
            return stock;
        }
        if (stock == null || stock.isBlank()) {
            return brand;
        }
        return stock.toLowerCase().startsWith(brand.toLowerCase()) ? stock : brand + " " + stock;
    }
}
