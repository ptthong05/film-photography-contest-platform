package com.example.backend.security;

import com.example.backend.enums.Role;

/** Người dùng đang đăng nhập, lấy trong controller bằng @AuthenticationPrincipal. */
public record AuthenticatedUser(
        String id,
        String email,
        Role role
) {
}
