package com.example.backend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Một tiêu chí chấm trong danh sách ban tổ chức gửi lên; weight tính theo %. */
public record JudgingCriterionRequest(
        @NotBlank(message = "Tên tiêu chí không được để trống")
        @Size(max = 100, message = "Tên tiêu chí tối đa 100 ký tự")
        String name,
        @Size(max = 500, message = "Mô tả tiêu chí tối đa 500 ký tự")
        String description,
        @DecimalMin(value = "1", message = "Điểm tối đa của tiêu chí phải từ 1 trở lên")
        @DecimalMax(value = "100", message = "Điểm tối đa của tiêu chí không quá 100")
        double maxScore,
        @DecimalMin(value = "0", inclusive = false, message = "Trọng số tiêu chí phải lớn hơn 0")
        @DecimalMax(value = "100", message = "Trọng số tiêu chí không quá 100")
        double weight
) {
}
