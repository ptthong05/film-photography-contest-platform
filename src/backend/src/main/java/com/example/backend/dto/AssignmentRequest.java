package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record AssignmentRequest(
        @NotBlank(message = "Vui lòng chọn cuộc thi")
        String contestId,
        @NotBlank(message = "Vui lòng chọn giám khảo")
        String judgeId,
        @NotEmpty(message = "Vui lòng chọn bài dự thi cần phân công")
        List<String> submissionIds
) {
}
