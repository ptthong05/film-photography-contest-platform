package com.example.backend.dto;

import com.example.backend.entity.embedded.FilmMetadata;

import java.time.Instant;
import java.util.List;

/**
 * Bài dự thi trong phạm vi được phân công cho giám khảo đang đăng nhập.
 * evaluationStatus / totalScore / evaluatedAt là phiếu chấm của chính giám khảo đó ở vòng được phân công.
 */
public record JudgeSubmissionResponse(
        String id,
        String contestId,
        String contestTitle,
        String roundId,
        String roundName,
        String title,
        /** null khi cuộc thi bật chấm ẩn danh */
        String authorName,
        String category,
        String description,
        Instant submittedAt,
        List<String> imageUrls,
        List<String> thumbnailUrls,
        List<String> negativeUrls,
        String contactSheetUrl,
        FilmMetadata metadata,
        /** NOT_STARTED (chưa có phiếu) / DRAFT / FINALIZED */
        String evaluationStatus,
        /** null khi phiếu chưa FINALIZED */
        Double totalScore,
        Instant evaluatedAt
) {
}
