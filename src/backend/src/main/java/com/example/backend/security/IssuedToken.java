package com.example.backend.security;

import java.time.Instant;

public record IssuedToken(
        String token,
        Instant expiresAt
) {
}
