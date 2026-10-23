package com.example.backend.dto;

import java.time.Instant;

/** Trả về sau khi đăng nhập / đăng ký: frontend gửi token trong header Authorization: Bearer <token>. */
public record AuthResponse(
        String token,
        Instant expiresAt,
        UserResponse user
) {
}
