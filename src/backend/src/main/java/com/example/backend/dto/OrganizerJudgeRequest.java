package com.example.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record OrganizerJudgeRequest(
        @NotBlank(message = "Vui lòng nhập họ tên")
        String fullName,
        @NotBlank(message = "Vui lòng nhập email")
        @Email(message = "Email không đúng định dạng")
        String email,
        @NotBlank(message = "Vui lòng nhập chuyên môn")
        String specialty
) {
}
