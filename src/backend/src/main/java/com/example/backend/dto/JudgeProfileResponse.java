package com.example.backend.dto;

import com.example.backend.entity.JudgeProfile;
import com.example.backend.entity.User;

/** Trường chưa có dữ liệu trả về chuỗi rỗng để giao diện không phải xử lý null. */
public record JudgeProfileResponse(
        String id,
        String fullName,
        String email,
        String phone,
        String specialty,
        String bio,
        String avatarUrl
) {
    public static JudgeProfileResponse from(User user, JudgeProfile profile) {
        return new JudgeProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                orEmpty(user.getPhone()),
                profile == null ? "" : orEmpty(profile.getSpecialty()),
                profile == null ? "" : orEmpty(profile.getBio()),
                profile == null ? "" : orEmpty(profile.getAvatarUrl()));
    }

    private static String orEmpty(String value) {
        return value == null ? "" : value;
    }
}
