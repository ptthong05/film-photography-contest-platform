package com.example.backend.dto;

import com.example.backend.entity.Notification;
import com.example.backend.enums.NotificationType;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

/** Khớp interface JudgeNotification ở frontend */
public record NotificationResponse(
        String id,
        NotificationType type,
        String message,
        Instant createdAt,
        @JsonProperty("isRead")
        boolean isRead
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getMessage(),
                notification.getCreatedAt(),
                notification.isRead());
    }
}
