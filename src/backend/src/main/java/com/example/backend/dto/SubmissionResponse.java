package com.example.backend.dto;

import com.example.backend.entity.*;
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
        String frameId,
        List<String> imageUrls,
        List<String> thumbnailUrls,
        List<String> negativeUrls,
        String contactSheetUrl,
        FilmMetadata metadata,
        SubmissionStatus status,
        String rejectionReason,
        Object aiVerification,
        Double totalScore,
        String prizeRank,
        boolean resultPublished,
        Instant submittedAt,
        String reviewedBy,
        Instant reviewedAt,
        long version) {
    public static SubmissionResponse from(Submission s) {
        return new SubmissionResponse(
                s.getId(),
                "SUB-" + s.getId().substring(0, 8),
                s.getContestId(),
                null,
                s.getParticipantId(),
                null,
                null,
                s.getTitle(),
                s.getDescription(),
                s.getCategory(),
                s.getFrame() == null ? null : s.getFrame().getId(),
                List.of(s.getImageUrl()),
                List.of(s.getImageUrl()),
                s.getNegativeUrl() == null ? List.of() : List.of(s.getNegativeUrl()),
                null,
                s.getMetadata(),
                s.getStatus(),
                s.getRejectionReason(),
                null,
                null,
                null,
                false,
                s.getCreatedAt(),
                s.getReviewedBy(),
                s.getReviewedAt(),
                s.getVersion());
    }
}
