package com.example.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Tự đăng ký chỉ tạo được tài khoản Thí sinh; không nhận role từ client. */
public record RegisterRequest(
        @NotBlank(message = "Họ tên không được để trống")
        @Size(max = 100, message = "Họ tên tối đa 100 ký tự")
        String name,

        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không đúng định dạng")
        String email,

        @NotBlank(message = "Số điện thoại không được để trống")
        @Pattern(regexp = ValidationPatterns.VN_PHONE, message = ValidationPatterns.VN_PHONE_MESSAGE)
        String phone,

        @NotBlank(message = "Mật khẩu không được để trống")
        @Size(min = 8, max = 72, message = ValidationPatterns.PASSWORD_MESSAGE)
        String password
) {
}
