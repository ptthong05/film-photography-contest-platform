package com.example.backend.dto;

import com.example.backend.entity.Notification;
import com.example.backend.enums.NotificationType;

import java.time.Instant;

public record NotificationResponse(
        String id,
        NotificationType type,
        String title,
        String message,
        String link,
        Instant createdAt,
        boolean isRead
) {
    public static NotificationResponse fromEntity(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getLink(),
                notification.getCreatedAt(),
                notification.isRead());
    }
}
