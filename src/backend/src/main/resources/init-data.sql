-- ========================================================
-- Script khởi tạo Database & Dữ liệu mẫu 4 quyền người dùng
-- Film Photography Contest Platform
-- Mật khẩu mặc định của tất cả tài khoản là: 123456
-- ========================================================

CREATE DATABASE IF NOT EXISTS film_photography_contest_management_db
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE film_photography_contest_management_db;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'PARTICIPANT',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    must_change_password BOOLEAN DEFAULT FALSE
);

-- Mật khẩu hash BCrypt của '123456'
-- Tài khoản ORGANIZER và JUDGE do Admin cấp nên bắt buộc đổi mật khẩu lần đầu (must_change_password = TRUE)
INSERT INTO users (id, name, email, phone, password, role, status, must_change_password) VALUES
('u-admin-01', 'Quản Trị Viên', 'admin@gmail.com', '0900000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 'ACTIVE', FALSE),
('u-admin-02', 'Nguyễn Văn A', 'nguyenvana@example.com', '0901234567', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 'ACTIVE', FALSE),
('u-org-01', 'Ban Tổ Chức', 'organizer@gmail.com', '0900000002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ORGANIZER', 'ACTIVE', TRUE),
('u-org-02', 'Phạm Thị Dung', 'phamthidung@example.com', '0901234568', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ORGANIZER', 'ACTIVE', TRUE),
('u-judge-01', 'Ban Giám Khảo', 'judge@gmail.com', '0900000003', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'JUDGE', 'ACTIVE', TRUE),
('u-judge-02', 'Trần Thị Bình', 'tranthibinh@filmcontest.vn', '0901234569', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'JUDGE', 'ACTIVE', TRUE),
('u-part-01', 'Thí Sinh', 'participant@gmail.com', '0900000004', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PARTICIPANT', 'ACTIVE', FALSE),
('u-part-02', 'Hồ Thanh Bình', 'thanhbinh.photo@filmcontest.vn', '0901234570', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PARTICIPANT', 'ACTIVE', FALSE)
ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone), role=VALUES(role), must_change_password=VALUES(must_change_password);
