package com.example.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Thông tin hồ sơ riêng của giám khảo, tách khỏi bảng users để không đụng tới phần xác thực.
 * Họ tên, email, số điện thoại vẫn đọc từ users.
 */
@Entity
@Table(
        name = "judge_profiles",
        uniqueConstraints = @UniqueConstraint(name = "uk_judge_profile_user", columnNames = "user_id"))
public class JudgeProfile extends BaseEntity {

    /** -> users.id */
    @Column(nullable = false, length = 36)
    private String userId;

    @Column(length = 120)
    private String specialty;

    @Column(length = 500)
    private String bio;

    /** Data URL của ảnh (chưa cấu hình kho ảnh cho hồ sơ), tối đa ~1 MB */
    @Lob
    @Column(columnDefinition = "MEDIUMTEXT")
    private String avatarUrl;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getSpecialty() {
        return specialty;
    }

    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}
