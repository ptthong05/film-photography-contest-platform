package com.example.backend.dto;

import com.example.backend.enums.Role;

import java.time.Instant;

public record ActivityLogResponse(
        String id,
        String actorId,
        String actorName,
        String actorEmail,
        Role actorRole,
        String action,
        String targetType,
        String targetId,
        String details,
        Instant createdAt
) {
}
