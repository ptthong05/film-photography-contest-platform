package com.example.backend.service;

import com.example.backend.dto.NotificationResponse;
import com.example.backend.entity.Notification;
import com.example.backend.enums.NotificationType;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void send(String recipientId, NotificationType type, String title, String message, String link) {
        Notification notification = new Notification();
        notification.setRecipientId(recipientId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setLink(link);
        notificationRepository.save(notification);
    }

    public void sendToAll(Collection<String> recipientIds, NotificationType type, String title, String message, String link) {
        new HashSet<>(recipientIds).forEach(id -> send(id, type, title, message, link));
    }

    public List<NotificationResponse> getMine(String userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationResponse::fromEntity)
                .toList();
    }

    public void markAllRead(String userId) {
        List<Notification> unread = notificationRepository.findByRecipientIdAndReadFalse(userId);
        unread.forEach(item -> item.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public NotificationResponse markRead(String userId, String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .filter(item -> userId.equals(item.getRecipientId()))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo"));
        notification.setRead(true);
        return NotificationResponse.fromEntity(notificationRepository.save(notification));
    }
}
