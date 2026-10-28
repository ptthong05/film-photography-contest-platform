package com.example.backend.dto;

import com.example.backend.entity.embedded.JudgingCriterion;
import com.example.backend.entity.embedded.JudgingRound;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.List;

/** Cuộc thi có bài được phân công cho giám khảo đang đăng nhập, kèm tiến độ chấm của chính giám khảo đó. */
public record JudgeContestResponse(
        String id,
        String title,
        String coverUrl,
        /** Thời gian chấm (judgingStart / judgingEnd) */
        Instant startDate,
        Instant endDate,
        /** Tiến độ chấm: NOT_STARTED / JUDGING / COMPLETED, không phải giai đoạn của cuộc thi */
        String status,
        JudgingRound currentRound,
        List<JudgingCriterion> criteria,
        int assignedCount,
        int evaluatedCount,
        @JsonProperty("isResultPublished")
        boolean isResultPublished
) {
}
