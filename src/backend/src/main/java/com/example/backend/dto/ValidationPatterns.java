package com.example.backend.dto;

/** Ràng buộc dùng chung giữa các DTO, giữ khớp với utils/phoneValidator.ts bên frontend. */
public final class ValidationPatterns {

    /** 10 số, đầu số nhà mạng Việt Nam. Rỗng được chấp nhận vì SĐT không bắt buộc ở mọi form. */
    public static final String VN_PHONE = "^$|^0[35789]\\d{8}$";
    public static final String VN_PHONE_MESSAGE =
            "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 03, 05, 07, 08 hoặc 09";

    /** BCrypt chỉ dùng 72 byte đầu nên giới hạn trên là 72. */
    public static final String PASSWORD_MESSAGE = "Mật khẩu phải từ 8 đến 72 ký tự";

    private ValidationPatterns() {
    }
}
