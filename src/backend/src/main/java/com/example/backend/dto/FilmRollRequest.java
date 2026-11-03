package com.example.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record FilmRollRequest(
        @NotBlank(message = "Vui lòng nhập tên cuộn phim")
        String name,
        String brand,
        @Min(value = 1, message = "ISO phải lớn hơn 0")
        int iso,
        String format,
        String cameraBody,
        @Min(value = 1, message = "Số khung hình phải từ 1 trở lên")
        int totalFrames,
        List<Integer> usedFrameNumbers
) {
}
