package com.example.backend.dto;

import com.example.backend.enums.UserStatus;
import jakarta.validation.constraints.NotNull;

/** Admin khóa / mở khóa tài khoản. */
public record UserStatusRequest(
        @NotNull(message = "Trạng thái không được để trống")
        UserStatus status
) {
}
