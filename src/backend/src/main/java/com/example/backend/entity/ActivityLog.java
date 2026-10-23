package com.example.backend.entity;

import com.example.backend.enums.Role;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** Nhật ký thao tác cho Admin giám sát. Chỉ thêm mới, không sửa/xóa. */
@Document(collection = "activity_logs")
public class ActivityLog extends BaseDocument {

    /** null = hệ thống tự thực hiện */
    @Indexed
    private String actorId;

    private Role actorRole;

    /** Ví dụ: USER_LOCKED, CONTEST_CREATED */
    private String action;

    private String targetType;

    private String targetId;

    private String details;

    public ActivityLog() {
    }

    public String getActorId() {
        return actorId;
    }

    public void setActorId(String actorId) {
        this.actorId = actorId;
    }

    public Role getActorRole() {
        return actorRole;
    }

    public void setActorRole(Role actorRole) {
        this.actorRole = actorRole;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public String getTargetId() {
        return targetId;
    }

    public void setTargetId(String targetId) {
        this.targetId = targetId;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
