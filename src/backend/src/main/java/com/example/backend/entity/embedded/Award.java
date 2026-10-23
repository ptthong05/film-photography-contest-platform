package com.example.backend.entity.embedded;

import com.example.backend.enums.PrizeRank;

/** Cơ cấu giải thưởng, nhúng trong contests.awards. */
public record Award(
        PrizeRank rank,
        String title,
        String reward,
        int quantity
) {
}
