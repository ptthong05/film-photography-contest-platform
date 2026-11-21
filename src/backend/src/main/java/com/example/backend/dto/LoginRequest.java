package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        String email,

        String identifier,

        @NotBlank(message = "Mật khẩu không được để trống")
        String password
) {
    public String getLoginIdentifier() {
        if (identifier != null && !identifier.isBlank()) {
            return identifier.trim();
        }
        if (email != null && !email.isBlank()) {
            return email.trim();
        }
        return "";
    }
}
