package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record ChangePasswordRequest(
        String identifier,
        @NotBlank(message = "Mật khẩu cũ không được để trống")
        String oldPassword,
        @NotBlank(message = "Mật khẩu mới không được để trống")
        String newPassword
) {
}
