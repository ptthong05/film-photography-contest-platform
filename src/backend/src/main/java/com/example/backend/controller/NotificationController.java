package com.example.backend.controller;

import com.example.backend.dto.NotificationResponse;
import com.example.backend.security.AuthenticatedUser;
import com.example.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Thông báo của người đang đăng nhập, dùng chung mọi role. */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMine(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(notificationService.getMine(currentUser.id()));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        notificationService.markAllRead(currentUser.id());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markRead(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String id) {
        return ResponseEntity.ok(notificationService.markRead(currentUser.id(), id));
    }
}
