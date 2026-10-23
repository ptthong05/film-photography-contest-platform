package com.example.backend.config;

import com.example.backend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * Admin không tự đăng ký được, nên lần đầu khởi động (DB chưa có Admin nào) sẽ tự tạo một tài khoản.
 * Mật khẩu lấy từ ADMIN_PASSWORD; nếu không đặt thì sinh ngẫu nhiên và in ra log một lần duy nhất,
 * để không phải commit mật khẩu mặc định lên Git.
 */
@Component
@Order(2)
public class AdminAccountInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminAccountInitializer.class);

    private final UserService userService;
    private final String adminEmail;
    private final String adminPassword;

    public AdminAccountInitializer(
            UserService userService,
            @Value("${app.admin.email}") String adminEmail,
            @Value("${app.admin.password}") String adminPassword) {
        this.userService = userService;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        boolean isGenerated = adminPassword == null || adminPassword.isBlank();
        String password = isGenerated ? generatePassword() : adminPassword;

        userService.createDefaultAdminIfMissing(adminEmail, password).ifPresent(admin -> {
            if (isGenerated) {
                log.warn("Đã tạo tài khoản Admin đầu tiên: {} / mật khẩu: {} (hãy lưu lại, mật khẩu chỉ hiện lần này)",
                        admin.email(), password);
            } else {
                log.info("Đã tạo tài khoản Admin đầu tiên: {} (mật khẩu lấy từ ADMIN_PASSWORD)", admin.email());
            }
        });
    }

    private static String generatePassword() {
        byte[] bytes = new byte[12];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
