package com.example.backend.dto;

import com.example.backend.entity.embedded.AiVerification;
import com.example.backend.entity.embedded.FilmMetadata;
import com.example.backend.enums.PrizeRank;
import com.example.backend.enums.SubmissionStatus;

import java.time.Instant;
import java.util.List;

public record SubmissionResponse(
        String id,
        String code,
        String contestId,
        String contestTitle,
        String participantId,
        String authorName,
        String authorEmail,
        String title,
        String description,
        String category,
        List<String> imageUrls,
        List<String> thumbnailUrls,
        List<String> negativeUrls,
        String contactSheetUrl,
        FilmMetadata metadata,
        SubmissionStatus status,
        String rejectionReason,
        AiVerification aiVerification,
        Double totalScore,
        PrizeRank prizeRank,
        boolean resultPublished,
        Instant submittedAt
) {
}
