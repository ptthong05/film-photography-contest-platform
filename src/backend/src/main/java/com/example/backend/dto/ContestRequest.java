package com.example.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

/** Tạo / sửa cuộc thi. Ngày dạng yyyy-MM-dd theo giờ Việt Nam. */
public record ContestRequest(
        @NotBlank(message = "Vui lòng nhập tên cuộc thi")
        @Size(max = 200, message = "Tên cuộc thi tối đa 200 ký tự")
        String title,
        String description,
        String theme,
        String coverUrl,
        List<String> categories,
        List<String> criteria,
        Integer maxPhotosPerParticipant,
        String regulations,
        LocalDate submissionStart,
        LocalDate submissionEnd,
        LocalDate judgingStart,
        LocalDate judgingEnd,
        LocalDate resultDate,
        @Valid List<PrizeDto> prizes,
        List<String> judgeIds,
        List<String> defaultJudgeIds,
        Boolean anonymousJudging,
        Boolean submissionOpen,
        Boolean paused
) {
}
