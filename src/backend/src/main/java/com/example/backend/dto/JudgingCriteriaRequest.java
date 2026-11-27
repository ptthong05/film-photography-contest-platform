package com.example.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/** Thay toàn bộ bộ tiêu chí của một cuộc thi; thứ tự trong danh sách = thứ tự hiển thị. */
public record JudgingCriteriaRequest(
        @NotEmpty(message = "Cuộc thi cần ít nhất 1 tiêu chí chấm")
        List<@Valid JudgingCriterionRequest> criteria
) {
}
