package com.example.backend.dto;

import com.example.backend.enums.PrizeRank;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/** Ban tổ chức công bố kết quả: danh sách bài được trao giải; các bài còn lại vẫn được xếp hạng nhưng không có giải. */
public record PublishResultsRequest(
        @NotNull(message = "Thiếu danh sách giải thưởng")
        List<@Valid Award> awards
) {
    public record Award(
            @NotBlank(message = "Thiếu bài dự thi được trao giải")
            String submissionId,
            @NotNull(message = "Thiếu hạng giải")
            PrizeRank prizeRank
    ) {
    }
}
