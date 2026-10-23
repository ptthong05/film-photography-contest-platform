package com.example.backend.entity;

import com.example.backend.enums.NotificationType;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

/** Thông báo gửi tới một người dùng. */
@CompoundIndex(name = "recipient_read", def = "{'recipientId': 1, 'read': 1, 'createdAt': -1}")
@Document(collection = "notifications")
public class Notification extends BaseDocument {

    /** -> users._id */
    private String recipientId;

    private NotificationType type;

    private String title;

    private String message;

    /** Đường dẫn hash trên frontend, ví dụ #/judge */
    private String link;

    private boolean read;

    public Notification() {
    }

    public String getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(String recipientId) {
        this.recipientId = recipientId;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }
}
