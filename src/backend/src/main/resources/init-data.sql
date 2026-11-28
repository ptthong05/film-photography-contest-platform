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

-- Dữ liệu Danh mục Cuộc thi
INSERT IGNORE INTO categories (id, name, description, created_at) VALUES
(1, 'Đời sống', 'Những lát cắt bình dị, chân thật của đời sống thường nhật', NOW()),
(2, 'Đường phố', 'Nhịp sống đô thị, con người và kiến trúc phố phường', NOW()),
(3, 'Chân dung', 'Ánh mắt, cảm xúc và chiều sâu tâm hồn con người qua lăng kính phim', NOW()),
(4, 'Phong cảnh & Thiên nhiên', 'Vẻ đẹp kỳ vĩ của thiên nhiên, đất trời và phong cảnh', NOW()),
(5, 'Đen trắng & Nghệ thuật', 'Ngôn ngữ của ánh sáng, bóng tối và hạt phim đen trắng cổ điển', NOW());

-- Dữ liệu Cuộc thi chính thức
INSERT IGNORE INTO contests (id, title, description, banner_url, organizer, category_id, start_date, end_date, registration_deadline, status, created_at) VALUES
(1, 'Analog Moments 2026', 'Lưu giữ những khoảnh khắc chân thật qua nhiếp ảnh phim. Khuyến khích các góc nhìn đời thường, chân thực và cảm xúc.', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80', 'FilmContest Studio', 1, '2026-09-01 00:00:00', '2026-11-30 23:59:59', '2026-11-20 23:59:59', 'ACTIVE', NOW()),
(2, 'Film & City 2026', 'Nhịp sống thành phố nhìn từ máy ảnh phim. Khám phá những góc phố quen thuộc dưới gam màu analog.', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80', 'Urban Film Club', 2, '2026-08-15 00:00:00', '2026-10-31 23:59:59', '2026-10-25 23:59:59', 'ACTIVE', NOW()),
(3, 'The Vintage Look', 'Tôn vinh phong cách ảnh cổ điển và sắc màu analog hoài niệm.', 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80', 'Retro Lab', 3, '2026-10-01 00:00:00', '2026-12-15 23:59:59', '2026-12-05 23:59:59', 'ACTIVE', NOW()),
(4, 'Nature on Film', 'Ghi lại vẻ đẹp thiên nhiên kỳ vĩ, hoa cỏ và mùa chuyển sắc trên chất liệu phim.', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80', 'Green Frames', 4, '2026-11-01 00:00:00', '2026-12-31 23:59:59', '2026-12-20 23:59:59', 'UPCOMING', NOW()),
(5, 'Black & White Stories', 'Những câu chuyện giàu cảm xúc qua phim đen trắng monochrome và tương phản ánh sáng.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', 'Analog Collective', 5, '2026-04-01 00:00:00', '2026-06-30 23:59:59', '2026-06-20 23:59:59', 'ENDED', NOW()),
(6, 'Golden Hour Film', 'Khám phá ánh sáng vàng ruộm lúc bình minh và hoàng hôn qua dải màu ấm của cuộn phim.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', 'Golden Photo Club', 4, '2026-09-10 00:00:00', '2026-11-20 23:59:59', '2026-11-10 23:59:59', 'ACTIVE', NOW()),
(7, 'Frames of Everyday Life', 'Những khoảnh khắc đời thường, con người và góc quán thân quen được kể bằng ảnh phim.', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80', 'FilmContest Studio', 1, '2026-10-05 00:00:00', '2026-12-05 23:59:59', '2026-11-25 23:59:59', 'ACTIVE', NOW()),
(8, 'Portraits in Grain', 'Cuộc thi ảnh chân dung nhấn mạnh ngôn ngữ hạt phim (grain) và chiều sâu cảm xúc nhân vật.', 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80', 'Retro Lab', 3, '2026-11-15 00:00:00', '2027-01-15 23:59:59', '2027-01-05 23:59:59', 'UPCOMING', NOW()),
(9, 'New Year on Film', 'Ghi lại những khoảnh khắc đầu năm mới, lễ hội và sum vầy bằng máy ảnh cơ học.', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80', 'Urban Film Club', 1, '2027-01-01 00:00:00', '2027-03-31 23:59:59', '2027-03-20 23:59:59', 'UPCOMING', NOW()),
(10, 'Spring Film Diary', 'Nhật ký mùa xuân qua từng khung hình analog tươi sáng.', 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80', 'Green Frames', 4, '2026-02-01 00:00:00', '2026-04-30 23:59:59', '2026-04-20 23:59:59', 'ENDED', NOW());

-- Dữ liệu Vòng thi
INSERT IGNORE INTO rounds (id, contest_id, name, round_order, start_date, end_date, description, created_at) VALUES
(1, 1, 'Vòng sơ loại & Đối chiếu âm bản', 1, '2026-09-01 00:00:00', '2026-10-15 23:59:59', 'Kiểm tra thông số phim và chất lượng âm bản', NOW()),
(2, 1, 'Vòng chung khảo & Chấm điểm chuyên môn', 2, '2026-10-16 00:00:00', '2026-11-30 23:59:59', 'Hội đồng giám khảo chấm điểm theo tiêu chí', NOW()),
(3, 2, 'Vòng chấm điểm chuyên môn', 1, '2026-08-15 00:00:00', '2026-10-31 23:59:59', 'Đánh giá nghệ thuật ảnh đường phố', NOW()),
(4, 3, 'Vòng chấm điểm chuyên môn', 1, '2026-10-01 00:00:00', '2026-12-15 23:59:59', 'Đánh giá phong cách vintage và tone màu', NOW()),
(5, 4, 'Vòng sơ loại', 1, '2026-11-01 00:00:00', '2026-12-31 23:59:59', 'Sơ loại ảnh phong cảnh', NOW());
