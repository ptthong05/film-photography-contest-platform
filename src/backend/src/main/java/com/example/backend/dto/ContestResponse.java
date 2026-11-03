package com.example.backend.dto;

import com.example.backend.entity.embedded.JudgingCriterion;
import com.example.backend.enums.ContestStatus;

import java.time.LocalDate;
import java.util.List;

/** status là giai đoạn hiệu lực tính theo mốc thời gian (xem ContestService.effectiveStatus). */
public record ContestResponse(
        String id,
        String title,
        String slug,
        String description,
        String theme,
        String coverUrl,
        List<String> categories,
        ContestStatus status,
        boolean archived,
        boolean submissionOpen,
        boolean paused,
        boolean acceptingSubmissions,
        boolean resultsPublished,
        LocalDate submissionStart,
        LocalDate submissionEnd,
        LocalDate judgingStart,
        LocalDate judgingEnd,
        LocalDate resultDate,
        int maxPhotosPerParticipant,
        boolean anonymousJudging,
        List<JudgingCriterion> criteria,
        List<PrizeDto> prizes,
        String regulations,
        String organizerId,
        String organizerName,
        List<String> judgeIds,
        List<String> defaultJudgeIds,
        List<String> judgeNames,
        long participantCount,
        long submissionCount
) {
}
