package com.example.backend.tv3.dto;

import jakarta.validation.constraints.*;

import java.util.List;

public record FilmRollRequest(
        @NotBlank(message = "Không được bỏ trống")
                @Size(max = 120, message = "Độ dài tối đa {max} ký tự")
                String name,
        @NotBlank(message = "Không được bỏ trống")
                @Size(max = 120, message = "Độ dài tối đa {max} ký tự")
                String brand,
        @Min(value = 1, message = "Phải lớn hơn 0") int iso,
        @NotBlank(message = "Không được bỏ trống")
                @Size(max = 40, message = "Độ dài tối đa {max} ký tự")
                String format,
        @NotBlank(message = "Không được bỏ trống")
                @Size(max = 200, message = "Độ dài tối đa {max} ký tự")
                String cameraBody,
        @Min(value = 1, message = "Phải lớn hơn 0") int totalFrames,
        List<
                        @NotNull(message = "Không được thiếu giá trị")
                        @Min(value = 1, message = "Phải lớn hơn 0") Integer>
                usedFrameNumbers) {}
