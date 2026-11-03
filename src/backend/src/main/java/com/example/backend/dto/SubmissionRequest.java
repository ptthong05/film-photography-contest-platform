package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/** Trường form khi nộp / sửa bài (multipart); tên trường theo api-design.md. */
public record SubmissionRequest(
        String contestId,
        @NotBlank(message = "Vui lòng nhập tên tác phẩm")
        @Size(max = 200, message = "Tên tác phẩm tối đa 200 ký tự")
        String title,
        String description,
        String category,
        String filmBrand,
        String filmStock,
        Integer iso,
        String camera,
        String lens,
        String format,
        String frameNumber,
        LocalDate shootingDate,
        String shootingLocation,
        String developingLab,
        String scanningSpecs
) {
}
