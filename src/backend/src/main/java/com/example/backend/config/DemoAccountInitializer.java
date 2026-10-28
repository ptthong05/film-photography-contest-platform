package com.example.backend.config;

import com.example.backend.enums.Role;
import com.example.backend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Tạo sẵn tài khoản mẫu cho 4 actor để cả nhóm đăng nhập thử khi phát triển.
 * Chạy trước AdminAccountInitializer: đã có admin mẫu thì không sinh thêm Admin mật khẩu ngẫu nhiên.
 * Chỉ tạo tài khoản chưa có, không ghi đè. Tắt bằng DEMO_ACCOUNTS_ENABLED=false khi lên môi trường thật.
 */
@Component
@Order(1)
public class DemoAccountInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoAccountInitializer.class);

    private record DemoAccount(String name, String email, String phone, String password, Role role) {
    }

    private static final List<DemoAccount> DEMO_ACCOUNTS = List.of(
            new DemoAccount("Quản trị viên", "admin@gmail.com", "0900000001", "admin12345", Role.ADMIN),
            new DemoAccount("Nguyễn Văn An", "organizer@gmail.com", "0900000002", "organizer12345", Role.ORGANIZER),
            new DemoAccount("Trần Thị Bình", "judge@gmail.com", "0900000003", "judge12345", Role.JUDGE),
            // Judge thứ 2 để kiểm tra mỗi giám khảo chỉ thấy bài được phân công cho mình (xem DemoJudgingDataInitializer)
            new DemoAccount("Phạm Quốc Dũng", "judge2@gmail.com", "0900000005", "judge12345", Role.JUDGE),
            new DemoAccount("Lê Minh Châu", "participant@gmail.com", "0900000004", "participant12345", Role.PARTICIPANT));

    private final UserService userService;
    private final boolean isEnabled;

    public DemoAccountInitializer(
            UserService userService,
            @Value("${app.demo-accounts.enabled}") boolean isEnabled) {
        this.userService = userService;
        this.isEnabled = isEnabled;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!isEnabled) {
            return;
        }
        for (DemoAccount account : DEMO_ACCOUNTS) {
            userService.createAccountIfMissing(account.name(), account.email(), account.phone(), account.password(), account.role())
                    .ifPresent(user -> log.info("Đã tạo tài khoản mẫu {}: {}", user.role(), user.email()));
        }
    }
}
