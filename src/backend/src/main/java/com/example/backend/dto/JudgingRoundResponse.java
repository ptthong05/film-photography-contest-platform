package com.example.backend.dto;

import com.example.backend.entity.Round;

import java.time.LocalDateTime;

/** Vòng chấm; khớp kiểu JudgingRound ở frontend (id dạng chuỗi dù rounds.id là số). */
public record JudgingRoundResponse(
        String id,
        String name,
        int order,
        LocalDateTime startDate,
        LocalDateTime endDate
) {
    public static JudgingRoundResponse fromEntity(Round round) {
        return new JudgingRoundResponse(
                String.valueOf(round.getId()),
                round.getName(),
                round.getRoundOrder() == null ? 1 : round.getRoundOrder(),
                round.getStartDate(),
                round.getEndDate());
    }
}
