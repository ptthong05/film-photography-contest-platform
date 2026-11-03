package com.example.backend.dto;

import com.example.backend.enums.SubmissionStatus;
import jakarta.validation.constraints.NotNull;

public record SubmissionStatusRequest(
        @NotNull(message = "Vui lòng chọn trạng thái")
        SubmissionStatus status,
        String reason
) {
}
