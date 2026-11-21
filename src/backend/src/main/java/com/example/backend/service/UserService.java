package com.example.backend.service;

import com.example.backend.dto.UserRequest;
import com.example.backend.dto.UserResponse;
import com.example.backend.entity.User;
import com.example.backend.enums.Role;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/** Service mẫu: chứa toàn bộ business logic, nhận/trả DTO. */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
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
        ensureEmailNotTaken(request.email());
        if (request.phone() != null && !request.phone().isBlank()) {
            ensurePhoneNotTaken(request.phone().trim());
        }

        User user = new User();
        applyRequest(user, request);
        String rawPassword = (request.password() != null && !request.password().isBlank())
                ? request.password().trim()
                : "123456";
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setStatus("ACTIVE");
        // Tất cả tài khoản do Quản trị viên cấp đều bắt buộc đổi mật khẩu lần đầu
        user.setMustChangePassword(true);
        return UserResponse.fromEntity(userRepository.save(user));
    }

    public UserResponse updateUser(String id, UserRequest request) {
        User user = findUserOrThrow(id);
        if (!user.getEmail().equalsIgnoreCase(request.email())) {
            ensureEmailNotTaken(request.email());
        }
        if (request.phone() != null && !request.phone().isBlank() &&
            (user.getPhone() == null || !user.getPhone().equals(request.phone().trim()))) {
            if (userRepository.existsByPhoneAndIdNot(request.phone().trim(), user.getId())) {
                throw new DuplicateResourceException("Số điện thoại đã tồn tại: " + request.phone().trim());
            }
        }

        applyRequest(user, request);
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password().trim()));
            user.setMustChangePassword(true);
        }
        return UserResponse.fromEntity(userRepository.save(user));
    }

    public UserResponse updateStatus(String id, String status) {
        User user = findUserOrThrow(id);
        user.setStatus(status != null ? status.toUpperCase() : "ACTIVE");
        return UserResponse.fromEntity(userRepository.save(user));
    }

    public void deleteUser(String id) {
        userRepository.delete(findUserOrThrow(id));
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
        if (userRepository.existsByPhone(phone)) {
            throw new DuplicateResourceException("Số điện thoại đã tồn tại: " + phone);
        }
    }

    private void applyRequest(User user, UserRequest request) {
        user.setName(request.name().trim());
        user.setEmail(request.email().trim().toLowerCase());
        if (request.phone() != null && !request.phone().isBlank()) {
            user.setPhone(request.phone().trim());
        }
        user.setRole(request.role() != null ? request.role() : Role.PARTICIPANT);
    }
}
