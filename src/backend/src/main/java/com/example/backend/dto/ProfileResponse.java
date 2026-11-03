package com.example.backend.dto;

import com.example.backend.entity.User;
import com.example.backend.entity.embedded.GearItem;
import com.example.backend.enums.Role;
import com.example.backend.enums.UserStatus;

import java.time.Instant;
import java.util.List;

public record ProfileResponse(
        String id,
        String name,
        String email,
        String phone,
        Role role,
        UserStatus status,
        String avatarUrl,
        String bio,
        String portfolioUrl,
        String specialty,
        Integer yearsOfExperience,
        String organizationName,
        List<GearItem> gear,
        String address,
        String equipment,
        List<String> portfolioImages,
        Instant createdAt
) {
    public static ProfileResponse fromEntity(User user) {
        return new ProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getStatus(),
                user.getAvatarUrl(),
                user.getBio(),
                user.getPortfolioUrl(),
                user.getSpecialty(),
                user.getYearsOfExperience(),
                user.getOrganizationName(),
                user.getGear(),
                user.getAddress(),
                user.getEquipment(),
                user.getPortfolioImages(),
                user.getCreatedAt());
    }
}
