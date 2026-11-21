package com.example.backend.service;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.ChangePasswordRequest;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RefreshTokenRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.dto.UpdateProfileRequest;
import com.example.backend.entity.RefreshToken;
import com.example.backend.entity.User;
import com.example.backend.enums.Role;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.RefreshTokenRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    public AuthService(UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String cleanEmail = request.email() != null ? request.email().trim().toLowerCase() : "";
        String cleanPhone = request.phone() != null && !request.phone().isBlank() ? request.phone().trim() : null;

        boolean emailExists = userRepository.existsByEmail(cleanEmail);
        boolean phoneExists = cleanPhone != null && userRepository.existsByPhone(cleanPhone);

        if (emailExists && phoneExists) {
            throw new DuplicateResourceException("Cả email và số điện thoại này đều đã được đăng ký trong hệ thống!");
        }
        if (emailExists) {
            throw new DuplicateResourceException("Email này đã được sử dụng: " + cleanEmail);
        }
        if (phoneExists) {
            throw new DuplicateResourceException("Số điện thoại này đã được sử dụng: " + cleanPhone);
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(cleanEmail);
        user.setPhone(cleanPhone);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.role() != null ? request.role() : Role.PARTICIPANT);
        user.setStatus("ACTIVE");

        User savedUser = userRepository.save(user);

        String accessToken = jwtService.generateToken(savedUser.getId(), savedUser.getEmail(),
                savedUser.getRole().name());
        RefreshToken refreshToken = createRefreshToken(savedUser);

        return new AuthResponse(accessToken, refreshToken.getToken(), "Bearer",
                AuthResponse.UserInfo.fromEntity(savedUser));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getLoginIdentifier();
        if (identifier.isBlank()) {
            throw new BadCredentialsException("Email hoặc số điện thoại không được để trống");
        }

        User user = userRepository.findByEmailOrPhone(identifier)
                .orElseThrow(() -> new BadCredentialsException("Thông tin đăng nhập không hợp lệ"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Thông tin đăng nhập không hợp lệ");
        }

        if ("LOCKED".equalsIgnoreCase(user.getStatus())) {
            throw new BadCredentialsException("Tài khoản của bạn đã bị khóa");
        }

        String accessToken = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        RefreshToken refreshToken = createRefreshToken(user);

        return new AuthResponse(accessToken, refreshToken.getToken(), "Bearer", AuthResponse.UserInfo.fromEntity(user));
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken token = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new ResourceNotFoundException("Refresh token không hợp lệ"));

        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new BadCredentialsException("Refresh token đã hết hạn, vui lòng đăng nhập lại");
        }

        User user = token.getUser();
        String newAccessToken = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return new AuthResponse(newAccessToken, token.getToken(), "Bearer", AuthResponse.UserInfo.fromEntity(user));
    }

    private RefreshToken createRefreshToken(User user) {
        refreshTokenRepository.deleteByUser(user);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshExpirationMs));

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        String identifier = request.identifier();
        if (identifier == null || identifier.isBlank()) {
            throw new BadCredentialsException("Thông tin tài khoản không hợp lệ");
        }

        User user = userRepository.findByEmailOrPhone(identifier)
                .or(() -> userRepository.findById(identifier))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            throw new BadCredentialsException("Mật khẩu hiện tại không chính xác!");
        }

        String newPwd = request.newPassword();
        if (newPwd.length() < 8) {
            throw new IllegalArgumentException("Mật khẩu mới phải có ít nhất 8 ký tự!");
        }
        if (!Character.isUpperCase(newPwd.charAt(0))) {
            throw new IllegalArgumentException("Ký tự đầu tiên của mật khẩu phải là chữ viết hoa!");
        }
        if (!newPwd.matches(".*[a-z].*")) {
            throw new IllegalArgumentException("Mật khẩu mới phải chứa ít nhất một chữ cái thường!");
        }
        if (!newPwd.matches(".*\\d.*")) {
            throw new IllegalArgumentException("Mật khẩu mới phải chứa ít nhất một chữ số!");
        }
        if (!newPwd.matches(".*[!@#$%^&*(),.?\":{}|<>_\\-].*")) {
            throw new IllegalArgumentException("Mật khẩu mới phải chứa ít nhất một ký tự đặc biệt!");
        }

        if (passwordEncoder.matches(newPwd, user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới không được trùng với mật khẩu cũ!");
        }

        user.setPassword(passwordEncoder.encode(newPwd));
        user.setMustChangePassword(false);
        userRepository.save(user);
    }

    @Transactional
    public AuthResponse.UserInfo updateProfile(UpdateProfileRequest request) {
        String identifier = request.identifier();
        if (identifier == null || identifier.isBlank()) {
            throw new BadCredentialsException("Thông tin tài khoản không hợp lệ");
        }

        User user = userRepository.findByEmailOrPhone(identifier)
                .or(() -> userRepository.findById(identifier))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name().trim());
        }
        // LƯU Ý: Email, Số điện thoại và Chức vụ (role) TUYỆT ĐỐI không thay đổi theo yêu cầu
        User saved = userRepository.save(user);
        return AuthResponse.UserInfo.fromEntity(saved);
    }
}
