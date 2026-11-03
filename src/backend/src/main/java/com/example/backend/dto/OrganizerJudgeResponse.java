package com.example.backend.dto;

import com.example.backend.enums.UserStatus;

/** temporaryPassword chỉ có khi vừa tạo tài khoản, để Organizer gửi cho giám khảo. */
public record OrganizerJudgeResponse(
        String id,
        String fullName,
        String email,
        String specialty,
        long contestCount,
        UserStatus status,
        boolean isDefault,
        long evaluationCount,
        java.time.Instant joinedAt,
        String temporaryPassword
) {
}
