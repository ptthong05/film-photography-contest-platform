package com.example.backend.dto;

import com.example.backend.enums.SubmissionStatus;

import jakarta.validation.constraints.*;

public record SubmissionStatusRequest(
        @NotNull(message = "Không được thiếu giá trị") SubmissionStatus status,
        @Size(max = 1000, message = "Độ dài tối đa {max} ký tự") String reason) {}
