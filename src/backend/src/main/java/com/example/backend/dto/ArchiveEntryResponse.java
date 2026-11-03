package com.example.backend.dto;

import com.example.backend.entity.ArchiveEntry;
import com.example.backend.entity.embedded.FilmMetadata;
import com.example.backend.entity.embedded.JudgeComment;
import com.example.backend.enums.PrizeRank;

import java.util.List;

public record ArchiveEntryResponse(
        String id,
        String submissionId,
        String contestId,
        String contestTitle,
        int year,
        String participantId,
        String authorName,
        String title,
        String description,
        String imageUrl,
        String thumbnailUrl,
        PrizeRank prizeRank,
        Double totalScore,
        FilmMetadata metadata,
        List<JudgeComment> judgeComments,
        java.time.Instant awardedAt
) {
    public static ArchiveEntryResponse fromEntity(ArchiveEntry entry) {
        return new ArchiveEntryResponse(
                entry.getId(),
                entry.getSubmissionId(),
                entry.getContestId(),
                entry.getContestTitle(),
                entry.getYear(),
                entry.getParticipantId(),
                entry.getAuthorName(),
                entry.getTitle(),
                entry.getDescription(),
                entry.getImageUrl(),
                entry.getThumbnailUrl(),
                entry.getPrizeRank(),
                entry.getTotalScore(),
                entry.getMetadata(),
                entry.getJudgeComments(),
                entry.getCreatedAt());
    }
}
