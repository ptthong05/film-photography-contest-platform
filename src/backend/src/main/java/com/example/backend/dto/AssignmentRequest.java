package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.time.LocalDate;
import java.util.List;

/**
 * roundId bỏ trống = vòng có roundOrder lớn nhất của cuộc thi.
 * deadline (tuỳ chọn) = hạn chấm: tạo vòng chấm đầu tiên nếu cuộc thi chưa có vòng, hoặc dời ngày kết thúc của vòng.
 */
public record AssignmentRequest(
        @NotBlank(message = "Vui lòng chọn cuộc thi")
        String contestId,
        String roundId,
        @NotBlank(message = "Vui lòng chọn giám khảo")
        String judgeId,
        @NotEmpty(message = "Vui lòng chọn bài dự thi cần phân công")
        List<String> submissionIds,
        LocalDate deadline
) {
}
