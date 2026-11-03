package com.example.backend.dto;

import com.example.backend.enums.UserStatus;

import java.time.Instant;
import java.util.List;

public record OrganizerParticipantResponse(
        String id,
        String fullName,
        String email,
        String phone,
        long submissionCount,
        Instant registeredAt,
        UserStatus status,
        List<String> contestIds
) {
}
