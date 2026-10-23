package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;

/** identifier là email hoặc số điện thoại. */
public record LoginRequest(
        @NotBlank(message = "Vui lòng nhập email hoặc số điện thoại")
        String identifier,

        @NotBlank(message = "Vui lòng nhập mật khẩu")
        String password
) {
}
