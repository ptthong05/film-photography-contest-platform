package com.example.backend.entity;

import com.example.backend.entity.embedded.GearItem;
import com.example.backend.enums.Role;
import com.example.backend.enums.UserStatus;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Tài khoản người dùng của cả 4 vai trò. Thông tin riêng từng vai trò (gear, specialty) để chung, trường nào không
 * dùng thì null.
 */
@Document(collection = "users")
public class User extends BaseDocument {

    private String name;

    /** Luôn lưu chữ thường để so khớp không phân biệt hoa thường */
    @Indexed(unique = true)
    private String email;

    /** Dạng 0xxxxxxxxx, dùng để đăng nhập thay email */
    @Indexed(unique = true, sparse = true)
    private String phone;

    /** BCrypt, không bao giờ trả ra API */
    private String passwordHash;

    @Indexed
    private Role role = Role.PARTICIPANT;

    private UserStatus status = UserStatus.ACTIVE;

    private String avatarUrl;

    private String bio;

    private String portfolioUrl;

    /** Chuyên môn của giám khảo */
    private String specialty;

    /** Tên CLB / trường / lab của ban tổ chức */
    private String organizationName;

    /** Bộ đồ nghề thí sinh lưu sẵn */
    private List<GearItem> gear = new ArrayList<>();

    private Instant lastLoginAt;

    public User() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getPortfolioUrl() {
        return portfolioUrl;
    }

    public void setPortfolioUrl(String portfolioUrl) {
        this.portfolioUrl = portfolioUrl;
    }

    public String getSpecialty() {
        return specialty;
    }

    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public List<GearItem> getGear() {
        return gear;
    }

    public void setGear(List<GearItem> gear) {
        this.gear = gear;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(Instant lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }
}
