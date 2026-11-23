package com.example.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;

/** Cuộc thi có bài được phân công cho giám khảo đang đăng nhập, kèm tiến độ chấm của chính giám khảo đó. */
public record JudgeContestResponse(
        String id,
        String title,
        String coverUrl,
        /** Thời gian chấm: lấy theo vòng hiện tại của giám khảo */
        LocalDateTime startDate,
        LocalDateTime endDate,
        /** Tiến độ chấm: NOT_STARTED / JUDGING / COMPLETED, không phải giai đoạn của cuộc thi */
        String status,
        JudgingRoundResponse currentRound,
        List<JudgingCriterionResponse> criteria,
        int assignedCount,
        int evaluatedCount,
        @JsonProperty("isResultPublished")
        boolean isResultPublished
) {
}
