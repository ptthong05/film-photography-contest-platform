package com.example.backend.service;

import com.example.backend.dto.NotificationResponse;
import com.example.backend.entity.Notification;
import com.example.backend.enums.NotificationType;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.NotificationRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class NotificationService {

    /** Chuông và trang "Tin nhắn" chỉ cần các thông báo gần nhất */
    static final int MAX_RESULTS = 50;
    static final int MAX_MESSAGE_LENGTH = 500;

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /** Ghi trong cùng transaction với thao tác gây ra thông báo (phân công, nhắc hạn...) */
    @Transactional
    public void notify(String recipientId, NotificationType type, String message) {
        Notification notification = new Notification();
        notification.setRecipientId(recipientId);
        notification.setType(type);
        notification.setMessage(message.length() > MAX_MESSAGE_LENGTH
                ? message.substring(0, MAX_MESSAGE_LENGTH - 1) + "…"
                : message);
        notificationRepository.save(notification);
    }

    public List<NotificationResponse> getForUser(String userId) {
        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId, PageRequest.of(0, MAX_RESULTS)).stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional
    public void markAllRead(String userId) {
        List<Notification> unread = notificationRepository.findByRecipientIdAndReadAtIsNull(userId);
        if (unread.isEmpty()) {
            return;
        }
        Instant now = Instant.now();
        unread.forEach(item -> item.setReadAt(now));
        notificationRepository.saveAll(unread);
    }

    /** Thông báo của người khác trả 404 như không tồn tại */
    @Transactional
    public NotificationResponse markRead(String userId, String notificationId) {
        Notification notification = notificationRepository.findByIdAndRecipientId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo"));
        if (!notification.isRead()) {
            notification.setReadAt(Instant.now());
            notification = notificationRepository.save(notification);
        }
        return NotificationResponse.from(notification);
    }
}
