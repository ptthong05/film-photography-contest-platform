package com.example.backend.dto;

import com.example.backend.entity.embedded.CriterionScore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Giám khảo lưu nháp (isFinal = false) hoặc gửi chính thức (isFinal = true) phiếu chấm.
 * Kiểm tra điểm theo tiêu chí của cuộc thi nằm trong JudgeService vì cần dữ liệu cuộc thi.
 */
public record EvaluationRequest(
        @NotNull(message = "Thiếu danh sách điểm")
        List<CriterionScore> scores,
        @Size(max = 1000, message = "Nhận xét tối đa 1000 ký tự")
        String comment,
        @Size(max = 1000, message = "Ghi chú riêng tối đa 1000 ký tự")
        String privateNote,
        boolean recommendNextRound,
        @JsonProperty("isFinal")
        boolean isFinal
) {
}
