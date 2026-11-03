package com.example.backend.dto;

import com.example.backend.entity.embedded.GearItem;
import jakarta.validation.constraints.Size;

import java.util.List;

/** Sửa thông tin hồ sơ ngoài thông tin đăng nhập (họ tên / email / SĐT đi qua PUT /api/auth/me). Trường null giữ nguyên. */
public record ProfileRequest(
        String avatarUrl,
        @Size(max = 2000, message = "Giới thiệu tối đa 2000 ký tự")
        String bio,
        String portfolioUrl,
        String specialty,
        Integer yearsOfExperience,
        String organizationName,
        List<GearItem> gear,
        String address,
        String equipment,
        List<String> portfolioImages
) {
}
