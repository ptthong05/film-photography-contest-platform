package com.example.backend.controller;

import com.example.backend.dto.ProfileRequest;
import com.example.backend.dto.ProfileResponse;
import com.example.backend.entity.User;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Hồ sơ của chính người đang đăng nhập, dùng chung mọi role. */
@RestController
@RequestMapping("/api/auth/me/profile")
public class ProfileController {

    private final UserRepository userRepository;

    public ProfileController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(ProfileResponse.fromEntity(requireUser(currentUser.id())));
    }

    @PatchMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @Valid @RequestBody ProfileRequest request) {
        User user = requireUser(currentUser.id());
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl());
        }
        if (request.bio() != null) {
            user.setBio(request.bio());
        }
        if (request.portfolioUrl() != null) {
            user.setPortfolioUrl(request.portfolioUrl());
        }
        if (request.specialty() != null) {
            user.setSpecialty(request.specialty());
        }
        if (request.yearsOfExperience() != null) {
            user.setYearsOfExperience(request.yearsOfExperience());
        }
        if (request.organizationName() != null) {
            user.setOrganizationName(request.organizationName());
        }
        if (request.gear() != null) {
            user.setGear(request.gear());
        }
        if (request.address() != null) {
            user.setAddress(request.address());
        }
        if (request.equipment() != null) {
            user.setEquipment(request.equipment());
        }
        if (request.portfolioImages() != null) {
            user.setPortfolioImages(request.portfolioImages());
        }
        return ResponseEntity.ok(ProfileResponse.fromEntity(userRepository.save(user)));
    }

    private User requireUser(String id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));
    }
}
