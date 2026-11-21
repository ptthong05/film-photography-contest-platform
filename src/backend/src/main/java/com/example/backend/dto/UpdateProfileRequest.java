package com.example.backend.dto;

public record UpdateProfileRequest(
        String identifier,
        String name,
        String phone,
        String avatar
) {
}
