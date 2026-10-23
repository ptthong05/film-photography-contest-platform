package com.example.backend.config;

import com.example.backend.controller.AuthController;
import com.example.backend.controller.UserController;
import com.example.backend.dto.UserResponse;
import com.example.backend.entity.User;
import com.example.backend.enums.Role;
import com.example.backend.enums.UserStatus;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtService;
import com.example.backend.security.RestAuthErrorHandler;
import com.example.backend.service.AuthService;
import com.example.backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Kiểm tra quy tắc phân quyền theo URL trong SecurityConfig, đi qua filter JWT thật. */
@WebMvcTest(controllers = {UserController.class, AuthController.class})
@Import({SecurityConfig.class, RestAuthErrorHandler.class})
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private UserService userService;

    @MockBean
    private AuthService authService;

    @BeforeEach
    void setUp() {
        when(jwtService.extractUserId(anyString())).thenReturn(Optional.empty());
        givenToken("admin-token", user("admin-1", Role.ADMIN, UserStatus.ACTIVE));
        givenToken("participant-token", user("participant-1", Role.PARTICIPANT, UserStatus.ACTIVE));
        givenToken("locked-admin-token", user("admin-2", Role.ADMIN, UserStatus.LOCKED));
        when(userService.getAllUsers()).thenReturn(List.of());
    }

    @Test
    void usersApiWithoutTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Vui lòng đăng nhập để tiếp tục"));
    }

    @Test
    void usersApiWithInvalidTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/users").header("Authorization", "Bearer forged"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void usersApiAsParticipantReturns403() throws Exception {
        mockMvc.perform(get("/api/users").header("Authorization", "Bearer participant-token"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Bạn không có quyền thực hiện thao tác này"));
    }

    @Test
    void usersApiAsAdminReturns200() throws Exception {
        mockMvc.perform(get("/api/users").header("Authorization", "Bearer admin-token"))
                .andExpect(status().isOk());
    }

    @Test
    void lockedAccountTokenIsRejected() throws Exception {
        mockMvc.perform(get("/api/users").header("Authorization", "Bearer locked-admin-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginIsPublic() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\"a@b.vn\",\"password\":\"12345678\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void meRequiresLogin() throws Exception {
        mockMvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void meReturnsCurrentUserForAnyRole() throws Exception {
        when(authService.getCurrentUser("participant-1")).thenReturn(new UserResponse(
                "participant-1", "Thí sinh", "p@b.vn", null, Role.PARTICIPANT, UserStatus.ACTIVE, null, null, null));

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer participant-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("PARTICIPANT"));
    }

    private void givenToken(String token, User user) {
        when(jwtService.extractUserId(token)).thenReturn(Optional.of(user.getId()));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
    }

    private static User user(String id, Role role, UserStatus status) {
        User user = new User();
        user.setId(id);
        user.setEmail(id + "@filmcontest.vn");
        user.setRole(role);
        user.setStatus(status);
        return user;
    }
}
