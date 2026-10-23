package com.example.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Người dùng tự sửa thông tin tài khoản. Email/SĐT mới dùng luôn để đăng nhập; không nhận role hay mật khẩu. */
public record UpdateAccountRequest(
        @NotBlank(message = "Họ tên không được để trống")
        @Size(max = 100, message = "Họ tên tối đa 100 ký tự")
        String name,

        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không đúng định dạng")
        String email,

        @Pattern(regexp = ValidationPatterns.VN_PHONE, message = ValidationPatterns.VN_PHONE_MESSAGE)
        String phone
) {
}
