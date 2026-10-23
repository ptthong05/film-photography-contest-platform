package com.example.backend.dto;

import com.example.backend.entity.User;
import com.example.backend.enums.Role;
import com.example.backend.enums.UserStatus;

import java.time.Instant;

/** DTO mẫu cho response. Luôn map từ Entity qua fromEntity(). Không bao giờ chứa passwordHash. */
public record UserResponse(
        String id,
        String name,
        String email,
        String phone,
        Role role,
        UserStatus status,
        String avatarUrl,
        Instant createdAt,
        Instant lastLoginAt
) {
    public static UserResponse fromEntity(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getStatus(),
                user.getAvatarUrl(),
                user.getCreatedAt(),
                user.getLastLoginAt());
    }
}
