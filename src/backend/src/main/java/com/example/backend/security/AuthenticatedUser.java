package com.example.backend.security;

import com.example.backend.enums.Role;

/**
 * Người dùng đang đăng nhập, do JwtAuthenticationFilter đặt làm principal.
 * Controller lấy bằng @AuthenticationPrincipal; CurrentActor (tv3) cũng đọc id() và role() từ record này.
 */
public record AuthenticatedUser(
        String id,
        String email,
        Role role
) {
}
