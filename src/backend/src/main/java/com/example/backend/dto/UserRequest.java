package com.example.backend.dto;

import com.example.backend.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Admin tạo / sửa tài khoản. password bắt buộc khi tạo (kiểm tra trong service),
 * để trống khi sửa nghĩa là giữ nguyên mật khẩu cũ.
 */
public record UserRequest(
        @NotBlank(message = "Tên không được để trống")
        @Size(max = 100, message = "Tên tối đa 100 ký tự")
        String name,

        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không đúng định dạng")
        String email,

        @Pattern(regexp = ValidationPatterns.VN_PHONE, message = ValidationPatterns.VN_PHONE_MESSAGE)
        String phone,

        @Size(min = 8, max = 72, message = ValidationPatterns.PASSWORD_MESSAGE)
        String password,

        Role role
) {
}
