package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record PrizeDto(
        @NotBlank(message = "Vui lòng nhập tên giải thưởng")
        String name,
        String reward
) {
}
