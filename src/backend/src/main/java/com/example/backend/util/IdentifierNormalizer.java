package com.example.backend.util;

import java.util.Locale;

/** Chuẩn hóa email / số điện thoại trước khi lưu và so khớp, để "A@x.com" và "a@x.com" là một tài khoản. */
public final class IdentifierNormalizer {

    private IdentifierNormalizer() {
    }

    public static boolean isEmail(String identifier) {
        return identifier != null && identifier.contains("@");
    }

    public static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    /** Bỏ khoảng trắng/dấu chấm/gạch, đổi +84 về 0. Trả null nếu rỗng để không vướng unique index. */
    public static String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return null;
        }
        String digits = phone.replaceAll("[\\s.\\-()]", "");
        if (digits.startsWith("+84")) {
            return "0" + digits.substring(3);
        }
        if (digits.startsWith("84") && digits.length() == 11) {
            return "0" + digits.substring(2);
        }
        return digits;
    }
}
