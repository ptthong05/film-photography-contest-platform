package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record ReassignRequest(
        @NotBlank(message = "Vui lòng chọn giám khảo mới")
        String judgeId
) {
}
