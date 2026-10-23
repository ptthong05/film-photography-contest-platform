package com.example.backend.service;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.entity.User;
import com.example.backend.enums.Role;
import com.example.backend.enums.UserStatus;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ForbiddenOperationException;
import com.example.backend.exception.InvalidCredentialsException;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(4);
    private UserRepository userRepository;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        JwtService jwtService = new JwtService("", 60);
        authService = new AuthService(userRepository, passwordEncoder, jwtService);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            if (saved.getId() == null) {
                saved.setId("new-id");
            }
            return saved;
        });
    }

    @Test
    void loginByEmailIgnoresCaseAndReturnsToken() {
        User judge = existingUser("judge@filmcontest.vn", "0912345678", Role.JUDGE, UserStatus.ACTIVE);
        when(userRepository.findByEmail("judge@filmcontest.vn")).thenReturn(Optional.of(judge));

        AuthResponse response = authService.login(new LoginRequest("  Judge@FilmContest.vn ", "matkhau123"));

        assertThat(response.token()).isNotBlank();
        assertThat(response.user().role()).isEqualTo(Role.JUDGE);
        assertThat(judge.getLastLoginAt()).isNotNull();
    }

    @Test
    void loginByPhoneAcceptsInternationalFormat() {
        User participant = existingUser("p@filmcontest.vn", "0912345678", Role.PARTICIPANT, UserStatus.ACTIVE);
        when(userRepository.findByPhone("0912345678")).thenReturn(Optional.of(participant));

        AuthResponse response = authService.login(new LoginRequest("+84 912 345 678", "matkhau123"));

        assertThat(response.user().id()).isEqualTo(participant.getId());
    }

    @Test
    void wrongPasswordAndUnknownAccountGiveSameError() {
        User admin = existingUser("admin@filmcontest.vn", null, Role.ADMIN, UserStatus.ACTIVE);
        when(userRepository.findByEmail("admin@filmcontest.vn")).thenReturn(Optional.of(admin));
        when(userRepository.findByEmail("ghost@filmcontest.vn")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest("admin@filmcontest.vn", "sai-mat-khau")))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Email/số điện thoại hoặc mật khẩu không đúng");
        assertThatThrownBy(() -> authService.login(new LoginRequest("ghost@filmcontest.vn", "matkhau123")))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Email/số điện thoại hoặc mật khẩu không đúng");
    }

    @Test
    void lockedAccountCannotLogin() {
        User locked = existingUser("locked@filmcontest.vn", null, Role.ORGANIZER, UserStatus.LOCKED);
        when(userRepository.findByEmail("locked@filmcontest.vn")).thenReturn(Optional.of(locked));

        assertThatThrownBy(() -> authService.login(new LoginRequest("locked@filmcontest.vn", "matkhau123")))
                .isInstanceOf(ForbiddenOperationException.class);
    }

    @Test
    void registerAlwaysCreatesParticipantWithHashedPassword() {
        AuthResponse response = authService.register(
                new RegisterRequest("Nguyễn Văn A", "NewUser@FilmContest.vn", "0987654321", "matkhau123"));

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertThat(saved.getRole()).isEqualTo(Role.PARTICIPANT);
        assertThat(saved.getEmail()).isEqualTo("newuser@filmcontest.vn");
        assertThat(saved.getPasswordHash()).isNotEqualTo("matkhau123");
        assertThat(passwordEncoder.matches("matkhau123", saved.getPasswordHash())).isTrue();
        assertThat(response.token()).isNotBlank();
    }

    @Test
    void registerRejectsTakenEmail() {
        when(userRepository.existsByEmail("taken@filmcontest.vn")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(
                new RegisterRequest("B", "taken@filmcontest.vn", "0987654321", "matkhau123")))
                .isInstanceOf(DuplicateResourceException.class);
    }

    private User existingUser(String email, String phone, Role role, UserStatus status) {
        User user = new User();
        user.setId(role.name().toLowerCase() + "-1");
        user.setEmail(email);
        user.setPhone(phone);
        user.setRole(role);
        user.setStatus(status);
        user.setPasswordHash(passwordEncoder.encode("matkhau123"));
        return user;
    }
}
