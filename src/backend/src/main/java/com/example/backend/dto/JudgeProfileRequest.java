package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Giám khảo chỉ sửa được họ tên, chuyên môn, giới thiệu và ảnh đại diện.
 * Email, số điện thoại và vai trò do hệ thống quản lý nên không có trong request.
 * avatarUrl rỗng hoặc null = gỡ ảnh.
 */
public record JudgeProfileRequest(
        @NotBlank(message = "Vui lòng nhập họ và tên")
        @Size(min = 2, max = 80, message = "Họ và tên phải có từ 2 đến 80 ký tự")
        String fullName,

        @Size(max = 120, message = "Lĩnh vực chuyên môn tối đa 120 ký tự")
        String specialty,

        @Size(max = 500, message = "Giới thiệu tối đa 500 ký tự")
        String bio,

        @Size(max = JudgeProfileRequest.MAX_AVATAR_LENGTH, message = "Ảnh đại diện phải nhỏ hơn hoặc bằng 700 KB")
        @Pattern(
                regexp = "^$|^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$",
                message = "Ảnh đại diện chỉ chấp nhận JPG, PNG hoặc WebP")
        String avatarUrl
) {
    /** 700 KB sau khi mã hoá base64 (~4/3) cộng phần tiền tố data URL */
    public static final int MAX_AVATAR_LENGTH = 1_000_000;
}
