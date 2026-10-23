package com.example.backend.service;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.dto.UpdateAccountRequest;
import com.example.backend.dto.UserResponse;
import com.example.backend.entity.User;
import com.example.backend.enums.Role;
import com.example.backend.enums.UserStatus;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ForbiddenOperationException;
import com.example.backend.exception.InvalidCredentialsException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.IssuedToken;
import com.example.backend.security.JwtService;
import com.example.backend.util.IdentifierNormalizer;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
public class AuthService {

    // Cùng một thông báo cho "không có tài khoản" và "sai mật khẩu" để không lộ email nào đã đăng ký
    private static final String INVALID_CREDENTIALS = "Email/số điện thoại hoặc mật khẩu không đúng";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = IdentifierNormalizer.normalizeEmail(request.email());
        String phone = IdentifierNormalizer.normalizePhone(request.phone());
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email đã được đăng ký: " + email);
        }
        if (phone != null && userRepository.existsByPhone(phone)) {
            throw new DuplicateResourceException("Số điện thoại đã được đăng ký: " + phone);
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPhone(phone);
        user.setRole(Role.PARTICIPANT);
        user.setStatus(UserStatus.ACTIVE);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setLastLoginAt(Instant.now());
        return issueToken(userRepository.save(user));
    }

    public AuthResponse login(LoginRequest request) {
        User user = findByIdentifier(request.identifier())
                .filter(found -> found.getPasswordHash() != null)
                .filter(found -> passwordEncoder.matches(request.password(), found.getPasswordHash()))
                .orElseThrow(() -> new InvalidCredentialsException(INVALID_CREDENTIALS));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ForbiddenOperationException("Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên");
        }

        user.setLastLoginAt(Instant.now());
        return issueToken(userRepository.save(user));
    }

    public UserResponse getCurrentUser(String userId) {
        return userRepository.findById(userId)
                .map(UserResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));
    }

    /** Email/SĐT là thông tin đăng nhập nên phải kiểm tra trùng với tài khoản khác trước khi lưu. */
    public UserResponse updateCurrentUser(String userId, UpdateAccountRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));
        String email = IdentifierNormalizer.normalizeEmail(request.email());
        String phone = IdentifierNormalizer.normalizePhone(request.phone());
        if (!email.equals(user.getEmail()) && userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email đã được sử dụng: " + email);
        }
        if (phone != null && !phone.equals(user.getPhone()) && userRepository.existsByPhone(phone)) {
            throw new DuplicateResourceException("Số điện thoại đã được sử dụng: " + phone);
        }

        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPhone(phone);
        return UserResponse.fromEntity(userRepository.save(user));
    }

    private Optional<User> findByIdentifier(String identifier) {
        if (IdentifierNormalizer.isEmail(identifier)) {
            return userRepository.findByEmail(IdentifierNormalizer.normalizeEmail(identifier));
        }
        return userRepository.findByPhone(IdentifierNormalizer.normalizePhone(identifier));
    }

    private AuthResponse issueToken(User user) {
        IssuedToken token = jwtService.generateToken(user);
        return new AuthResponse(token.token(), token.expiresAt(), UserResponse.fromEntity(user));
    }
}
