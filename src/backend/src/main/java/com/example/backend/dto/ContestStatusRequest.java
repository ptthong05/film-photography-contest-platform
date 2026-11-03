package com.example.backend.dto;

import com.example.backend.enums.ContestStatus;
import jakarta.validation.constraints.NotNull;

public record ContestStatusRequest(
        @NotNull(message = "Vui lòng chọn trạng thái")
        ContestStatus status
) {
}
