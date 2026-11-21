package com.example.backend.dto;

import com.example.backend.entity.User;
import com.example.backend.enums.Role;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        UserInfo user) {
    public record UserInfo(
            String id,
            String name,
            String email,
            String phone,
            Role role,
            String status,
            Boolean mustChangePassword) {
        public static UserInfo fromEntity(User user) {
            return new UserInfo(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getPhone(),
                    user.getRole(),
                    user.getStatus(),
                    user.getMustChangePassword());
        }
    }
}
