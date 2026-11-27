package com.example.backend.dto;

import java.time.Instant;

/** Phiếu đã chốt của một giám khảo cho một bài, hiển thị ở bảng tổng hợp điểm của ban tổ chức. */
public record JudgeScoreResponse(
        String judgeId,
        String judgeName,
        double totalScore,
        String comment,
        boolean recommendNextRound,
        Instant finalizedAt
) {
}
