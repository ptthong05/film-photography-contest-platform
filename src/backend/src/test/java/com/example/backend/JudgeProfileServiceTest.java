package com.example.backend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.example.backend.dto.JudgeProfileRequest;
import com.example.backend.dto.JudgeProfileResponse;
import com.example.backend.entity.JudgeProfile;
import com.example.backend.entity.User;
import com.example.backend.enums.Role;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.JudgeProfileRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.JudgeProfileService;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Set;

@ExtendWith(MockitoExtension.class)
class JudgeProfileServiceTest {
    private static final String AVATAR = "data:image/png;base64,iVBORw0KGgo=";

    @Mock UserRepository users;
    @Mock JudgeProfileRepository profiles;
    JudgeProfileService service;
    User judge;

    @BeforeEach
    void init() {
        service = new JudgeProfileService(users, profiles);
        judge = new User();
        judge.setId("judge-1");
        judge.setName("Ban Giám Khảo");
        judge.setEmail("judge@gmail.com");
        judge.setRole(Role.JUDGE);
    }

    @Test
    void profileWithoutExtraInfoReturnsEmptyStrings() {
        when(users.findById("judge-1")).thenReturn(Optional.of(judge));
        when(profiles.findByUserId("judge-1")).thenReturn(Optional.empty());

        JudgeProfileResponse response = service.getProfile("judge-1");

        assertThat(response.fullName()).isEqualTo("Ban Giám Khảo");
        assertThat(response.email()).isEqualTo("judge@gmail.com");
        assertThat(response.phone()).isEmpty();
        assertThat(response.specialty()).isEmpty();
        assertThat(response.bio()).isEmpty();
        assertThat(response.avatarUrl()).isEmpty();
    }

    @Test
    void firstUpdateCreatesProfileAndRenamesUser() {
        when(users.findById("judge-1")).thenReturn(Optional.of(judge));
        when(profiles.findByUserId("judge-1")).thenReturn(Optional.empty());
        when(users.save(any(User.class))).thenAnswer(call -> call.getArgument(0));
        ArgumentCaptor<JudgeProfile> saved = ArgumentCaptor.forClass(JudgeProfile.class);
        when(profiles.save(saved.capture())).thenAnswer(call -> call.getArgument(0));

        JudgeProfileResponse response = service.updateProfile(
                "judge-1", new JudgeProfileRequest("  Trần Văn A ", " Ảnh phố ", "Giới thiệu", AVATAR));

        assertThat(saved.getValue().getUserId()).isEqualTo("judge-1");
        assertThat(judge.getName()).isEqualTo("Trần Văn A");
        assertThat(response.specialty()).isEqualTo("Ảnh phố");
        assertThat(response.avatarUrl()).isEqualTo(AVATAR);
        // Email không đổi qua hồ sơ
        assertThat(response.email()).isEqualTo("judge@gmail.com");
    }

    @Test
    void blankAvatarRemovesExistingAvatar() {
        JudgeProfile existing = new JudgeProfile();
        existing.setUserId("judge-1");
        existing.setAvatarUrl(AVATAR);
        when(users.findById("judge-1")).thenReturn(Optional.of(judge));
        when(profiles.findByUserId("judge-1")).thenReturn(Optional.of(existing));
        when(users.save(any(User.class))).thenAnswer(call -> call.getArgument(0));
        when(profiles.save(any(JudgeProfile.class))).thenAnswer(call -> call.getArgument(0));

        JudgeProfileResponse response = service.updateProfile(
                "judge-1", new JudgeProfileRequest("Ban Giám Khảo", "", "", ""));

        assertThat(existing.getAvatarUrl()).isNull();
        assertThat(response.avatarUrl()).isEmpty();
    }

    @Test
    void unknownUserReturnsNotFound() {
        when(users.findById("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getProfile("ghost")).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void requestRejectsShortNameAndNonImageAvatar() {
        Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

        Set<ConstraintViolation<JudgeProfileRequest>> violations = validator.validate(
                new JudgeProfileRequest("A", "", "", "data:text/html;base64,PGgxPg=="));

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .containsExactlyInAnyOrder("fullName", "avatarUrl");
    }

    @Test
    void requestAcceptsEmptyAvatarAndImageDataUrl() {
        Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

        assertThat(validator.validate(new JudgeProfileRequest("Ban Giám Khảo", "", "", ""))).isEmpty();
        assertThat(validator.validate(new JudgeProfileRequest("Ban Giám Khảo", "", "", AVATAR))).isEmpty();
    }
}
