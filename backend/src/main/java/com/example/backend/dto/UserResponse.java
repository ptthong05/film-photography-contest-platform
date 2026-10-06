package com.example.backend.dto;

import com.example.backend.entity.User;
import com.example.backend.enums.Role;

/** DTO mẫu cho response. Luôn map từ Entity qua fromEntity(). */
public record UserResponse(
        String id,
        String name,
        String email,
        Role role
) {
    public static UserResponse fromEntity(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
