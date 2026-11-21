package com.example.backend.config;

import com.example.backend.entity.User;
import com.example.backend.enums.Role;
import com.example.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Tài khoản chính thức dễ nhớ
        seedUserIfNotExists("Quản Trị Viên", "admin@gmail.com", "0900000001", "123456", Role.ADMIN, false);
        seedUserIfNotExists("Ban Tổ Chức", "organizer@gmail.com", "0900000002", "123456", Role.ORGANIZER, true);
        seedUserIfNotExists("Ban Giám Khảo", "judge@gmail.com", "0900000003", "123456", Role.JUDGE, true);
        seedUserIfNotExists("Thí Sinh", "participant@gmail.com", "0900000004", "123456", Role.PARTICIPANT, false);

        // Tài khoản theo tên demo hệ thống
        seedUserIfNotExists("Nguyễn Văn A", "nguyenvana@example.com", "0901234567", "123456", Role.ADMIN, false);
        seedUserIfNotExists("Phạm Thị Dung", "phamthidung@example.com", "0901234568", "123456", Role.ORGANIZER, true);
        seedUserIfNotExists("Trần Thị Bình", "tranthibinh@filmcontest.vn", "0901234569", "123456", Role.JUDGE, true);
        seedUserIfNotExists("Hồ Thanh Bình", "thanhbinh.photo@filmcontest.vn", "0901234570", "123456", Role.PARTICIPANT, false);
    }

    private void seedUserIfNotExists(String name, String email, String phone, String rawPassword, Role role, boolean mustChangePassword) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPhone(phone);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setRole(role);
            user.setStatus("ACTIVE");
            user.setMustChangePassword(mustChangePassword);
            userRepository.save(user);
        }
    }
}
