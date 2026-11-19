package com.example.backend.tv3.dto;

import jakarta.validation.constraints.*;

public record FrameRequest(
        @Min(value = 1, message = "Phải lớn hơn 0") int frameNumber,
        @Size(max = 1000, message = "Độ dài tối đa {max} ký tự") String notes) {}
