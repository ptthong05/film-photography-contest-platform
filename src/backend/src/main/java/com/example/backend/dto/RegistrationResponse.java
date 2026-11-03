package com.example.backend.dto;

import com.example.backend.enums.RegistrationStatus;

import java.time.Instant;

public record RegistrationResponse(
        String id,
        String contestId,
        String contestTitle,
        String participantId,
        RegistrationStatus status,
        Instant registeredAt
) {
}
