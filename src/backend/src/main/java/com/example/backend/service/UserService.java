package com.example.backend.service;

import com.example.backend.dto.UserRequest;
import com.example.backend.dto.UserResponse;
import com.example.backend.entity.User;
import com.example.backend.enums.Role;
import com.example.backend.enums.UserStatus;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ForbiddenOperationException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.UserRepository;
import com.example.backend.util.IdentifierNormalizer;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

/** Service mẫu: chứa toàn bộ business logic, nhận/trả DTO. Các API ở đây chỉ Admin gọi được (xem SecurityConfig). */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .toList();
    }

    public UserResponse getUserById(String id) {
        return UserResponse.fromEntity(findUserOrThrow(id));
    }

    public UserResponse createUser(UserRequest request) {
        if (request.password() == null || request.password().isBlank()) {
            throw new BadRequestException("Mật khẩu không được để trống khi tạo tài khoản");
        }
        String email = IdentifierNormalizer.normalizeEmail(request.email());
        String phone = IdentifierNormalizer.normalizePhone(request.phone());
        ensureEmailNotTaken(email);
        ensurePhoneNotTaken(phone);

        User user = new User();
        applyRequest(user, request, email, phone);
        return UserResponse.fromEntity(userRepository.save(user));
    }

    public UserResponse updateUser(String id, UserRequest request, String actorId) {
        User user = findUserOrThrow(id);
        String email = IdentifierNormalizer.normalizeEmail(request.email());
        String phone = IdentifierNormalizer.normalizePhone(request.phone());
        if (!email.equals(user.getEmail())) {
            ensureEmailNotTaken(email);
        }
        if (phone != null && !phone.equals(user.getPhone())) {
            ensurePhoneNotTaken(phone);
        }
        // Tránh Admin tự hạ quyền rồi không còn ai quản trị được hệ thống
        if (id.equals(actorId) && request.role() != null && request.role() != Role.ADMIN) {
            throw new ForbiddenOperationException("Không thể tự thay đổi quyền Admin của chính mình");
        }

        applyRequest(user, request, email, phone);
        return UserResponse.fromEntity(userRepository.save(user));
    }

    public UserResponse updateStatus(String id, UserStatus status, String actorId) {
        if (id.equals(actorId) && status != UserStatus.ACTIVE) {
            throw new ForbiddenOperationException("Không thể tự khóa tài khoản của chính mình");
        }
        User user = findUserOrThrow(id);
        user.setStatus(status);
        return UserResponse.fromEntity(userRepository.save(user));
    }

    public void deleteUser(String id, String actorId) {
        if (id.equals(actorId)) {
            throw new ForbiddenOperationException("Không thể tự xóa tài khoản của chính mình");
        }
        userRepository.delete(findUserOrThrow(id));
    }

    /**
     * Tạo tài khoản Admin đầu tiên nếu hệ thống chưa có Admin nào.
     * Trả về Optional.empty() khi đã có Admin, để chạy lại mỗi lần khởi động không tạo trùng.
     */
    public Optional<UserResponse> createDefaultAdminIfMissing(String rawEmail, String rawPassword) {
        if (userRepository.existsByRole(Role.ADMIN)) {
            return Optional.empty();
        }
        String email = IdentifierNormalizer.normalizeEmail(rawEmail);
        ensureEmailNotTaken(email);

        User admin = new User();
        admin.setName("Quản trị viên");
        admin.setEmail(email);
        admin.setRole(Role.ADMIN);
        admin.setStatus(UserStatus.ACTIVE);
        admin.setPasswordHash(passwordEncoder.encode(rawPassword));
        return Optional.of(UserResponse.fromEntity(userRepository.save(admin)));
    }

    /**
     * Tạo tài khoản mẫu nếu email chưa tồn tại; trả Optional.empty() khi đã có để chạy lại mỗi lần khởi động không tạo trùng.
     * SĐT đã bị người khác dùng thì bỏ trống thay vì làm hỏng cả lần khởi động.
     */
    public Optional<UserResponse> createAccountIfMissing(String name, String rawEmail, String rawPhone, String rawPassword, Role role) {
        String email = IdentifierNormalizer.normalizeEmail(rawEmail);
        if (userRepository.existsByEmail(email)) {
            return Optional.empty();
        }
        String phone = IdentifierNormalizer.normalizePhone(rawPhone);

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPhone(phone != null && userRepository.existsByPhone(phone) ? null : phone);
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        return Optional.of(UserResponse.fromEntity(userRepository.save(user)));
    }

    private User findUserOrThrow(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + id));
    }

    private void ensureEmailNotTaken(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email đã tồn tại: " + email);
        }
    }

    private void ensurePhoneNotTaken(String phone) {
        if (phone != null && userRepository.existsByPhone(phone)) {
            throw new DuplicateResourceException("Số điện thoại đã được sử dụng: " + phone);
        }
    }

    private void applyRequest(User user, UserRequest request, String email, String phone) {
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPhone(phone);
        user.setRole(Objects.requireNonNullElse(request.role(), Role.PARTICIPANT));
        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
    }
}
