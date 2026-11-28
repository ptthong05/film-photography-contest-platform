-- ========================================================
-- Script khởi tạo Database & Dữ liệu mẫu 4 quyền người dùng
-- Film Photography Contest Platform
-- Mật khẩu mặc định của tất cả tài khoản là: 123456
-- ========================================================

CREATE DATABASE IF NOT EXISTS film_photography_contest_management_db
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE film_photography_contest_management_db;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- Cuộn phim (Film Rolls)
INSERT IGNORE INTO film_rolls (id, created_at, updated_at, version, brand, camera_body, format, iso, name, participant_id, total_frames) VALUES
('roll-001', NOW(), NOW(), 0, 'Kodak', 'Nikon FM2', '35mm', 400, 'Kodak Portra 400 - Hà Nội Phố', 'u-part-01', 36),
('roll-002', NOW(), NOW(), 0, 'Fujifilm', 'Canon AE-1', '35mm', 200, 'Fujicolor C200 - Đà Lạt Sương', 'u-part-02', 36),
('roll-003', NOW(), NOW(), 0, 'Ilford', 'Leica M6', '35mm', 400, 'Ilford HP5 Plus - Sài Gòn Mono', 'u-part-01', 36),
('roll-004', NOW(), NOW(), 0, 'Kodak', 'Olympus OM-1', '35mm', 100, 'Kodak Ektar 100 - Biển Nắng', 'u-part-02', 36);

-- Khung hình (Frames)
INSERT IGNORE INTO frames (id, created_at, updated_at, version, frame_number, notes, film_roll_id) VALUES
('frm-001', NOW(), NOW(), 0, 12, 'Khung hình góc phố Tràng Tiền buổi sớm', 'roll-001'),
('frm-002', NOW(), NOW(), 0, 15, 'Góc cà phê đường tàu', 'roll-001'),
('frm-003', NOW(), NOW(), 0, 8, 'Đồi chè Cầu Đất lúc bình minh', 'roll-002'),
('frm-004', NOW(), NOW(), 0, 20, 'Gánh hàng rong trên phố đi bộ', 'roll-003'),
('frm-005', NOW(), NOW(), 0, 22, 'Bác đạp xích lô nghỉ trưa bên hông chợ', 'roll-003'),
('frm-006', NOW(), NOW(), 0, 5, 'Bình minh trên biển Nha Trang', 'roll-004');

-- Bài dự thi (Submissions)
INSERT IGNORE INTO submissions (id, created_at, updated_at, version, category, contest_id, description, image_public_id, image_url, camera, developing_lab, film_brand, film_format, film_stock, frame_number, iso, lens, scan_spec, shooting_date, shooting_location, participant_id, status, title, frame_id) VALUES
('sub-001', NOW(), NOW(), 0, 'Đời sống', '1', 'Khoảnh khắc bình minh trên phố cổ Hà Nội.', 'img_001', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80', 'Nikon FM2', 'Lab 35', 'Kodak', '35mm', 'Kodak Portra 400', '12', 400, '50mm f/1.4', 'Noritsu HS-1800', '2026-09-15', 'Hà Nội', 'u-part-01', 'VERIFIED', 'Bình minh Phố Cổ', 'frm-001'),
('sub-002', NOW(), NOW(), 0, 'Đường phố', '2', 'Nhịp sống hối hả lúc chiều tan tầm.', 'img_002', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80', 'Canon AE-1', 'Croplab', 'Fujifilm', '35mm', 'Fujicolor C200', '15', 200, '35mm f/2.0', 'Fuji Frontier SP-3000', '2026-08-20', 'TP. Hồ Chí Minh', 'u-part-02', 'VERIFIED', 'Sắc màu Đô Thị', 'frm-002'),
('sub-003', NOW(), NOW(), 0, 'Phong cảnh & Thiên nhiên', '4', 'Sương sớm bảng lảng phủ trên thung lũng thông.', 'img_003', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', 'Canon AE-1', 'Llab', 'Fujifilm', '35mm', 'Fujicolor C200', '8', 200, '50mm f/1.8', 'Noritsu HS-1800', '2026-11-05', 'Đà Lạt', 'u-part-02', 'PENDING', 'Thung Lũng Sương', 'frm-003'),
('sub-004', NOW(), NOW(), 0, 'Đen trắng & Nghệ thuật', '5', 'Tương phản đen trắng mạnh mẽ thể hiện dáng vẻ nhọc nhằn.', 'img_004', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', 'Leica M6', 'Nadir Lab', 'Ilford', '35mm', 'Ilford HP5 Plus', '20', 400, '35mm f/1.4 Summilux', 'Noritsu HS-1800', '2026-04-10', 'Hà Nội', 'u-part-01', 'VERIFIED', 'Gánh Hàng Rong', 'frm-004'),
('sub-005', NOW(), NOW(), 0, 'Chân dung', '3', 'Ánh mắt người thợ may già bên khung cửa gỗ cổ kính.', 'img_005', 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80', 'Nikon FM2', 'Lab 35', 'Kodak', '35mm', 'Kodak Portra 400', '22', 400, '85mm f/1.8', 'Fuji Frontier SP-3000', '2026-10-12', 'Hội An', 'u-part-01', 'VERIFIED', 'Người Thợ May Cũ', 'frm-005'),
('sub-006', NOW(), NOW(), 0, 'Phong cảnh & Thiên nhiên', '4', 'Mặt trời mọc đỏ ối đường chân trời biển sớm.', 'img_006', 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80', 'Olympus OM-1', 'Croplab', 'Kodak', '35mm', 'Kodak Ektar 100', '5', 100, '28mm f/2.8', 'Noritsu HS-1800', '2026-02-15', 'Nha Trang', 'u-part-02', 'VERIFIED', 'Bình Minh Trên Sóng', 'frm-006');

-- Tiêu chí chấm điểm (Judging Criteria)
INSERT IGNORE INTO judging_criteria (id, created_at, updated_at, version, contest_id, description, display_order, max_score, name, weight) VALUES
('crit-001', NOW(), NOW(), 0, 1, 'Bố cục đường dẫn, điểm nhấn và tỷ lệ khung hình phim', 1, 10.0, 'Bố cục & Ánh sáng', 0.3),
('crit-002', NOW(), NOW(), 0, 1, 'Chất lượng kiểm soát độ sáng, hạt phim và độ nét thủ công', 2, 10.0, 'Kỹ thuật ảnh phim', 0.3),
('crit-003', NOW(), NOW(), 0, 1, 'Thông điệp, cảm xúc và tính chân thực của khoảnh khắc đời sống', 3, 10.0, 'Cảm xúc & Nội dung', 0.4),
('crit-004', NOW(), NOW(), 0, 2, 'Bố cục và tương tác nhân vật trong không gian đô thị', 1, 10.0, 'Bố cục đường phố', 0.35),
('crit-005', NOW(), NOW(), 0, 2, 'Khoảnh khắc bấm máy quyết định (The Decisive Moment)', 2, 10.0, 'Khoảnh khắc bắt hình', 0.45),
('crit-006', NOW(), NOW(), 0, 2, 'Độ hòa hợp màu sắc và tone phim đặc trưng', 3, 10.0, 'Sắc màu analog', 0.20);

-- Phân công Giám khảo (Judge Assignments)
INSERT IGNORE INTO judge_assignments (id, created_at, updated_at, version, assigned_by, contest_id, judge_id, reminders_sent, round_id) VALUES
('asgn-001', NOW(), NOW(), 0, 'u-org-01', 1, 'u-judge-01', 0, 1),
('asgn-002', NOW(), NOW(), 0, 'u-org-01', 1, 'u-judge-02', 0, 1),
('asgn-003', NOW(), NOW(), 0, 'u-org-01', 1, 'u-judge-01', 0, 2),
('asgn-004', NOW(), NOW(), 0, 'u-org-01', 2, 'u-judge-02', 0, 3);

-- Chấm điểm & Đánh giá (Evaluations)
INSERT IGNORE INTO evaluations (id, created_at, updated_at, version, comment, contest_id, finalized_at, judge_id, private_note, recommend_next_round, round_id, status, submission_id, total_score) VALUES
('eval-001', NOW(), NOW(), 0, 'Ánh sáng và cảm xúc bức ảnh rất chân thật, độ nổi hạt phim đẹp.', 1, NOW(), 'u-judge-01', 'Ứng viên tiềm năng cho giải Nhất', b'1', 1, 'FINALIZED', 'sub-001', 9.2),
('eval-002', NOW(), NOW(), 0, 'Bắt trọn khoảnh khắc vàng, màu sắc Portra đặc trưng.', 1, NOW(), 'u-judge-02', 'Cần kiểm tra kỹ âm bản', b'1', 1, 'FINALIZED', 'sub-001', 8.8),
('eval-003', NOW(), NOW(), 0, 'Độ tương phản đen trắng ấn tượng, thông điệp sâu sắc.', 1, NOW(), 'u-judge-01', 'Tác phẩm đạt chuẩn vòng sau', b'1', 1, 'FINALIZED', 'sub-004', 9.0);

-- Bài viết / Tin tức Giám khảo (Articles)
INSERT IGNORE INTO articles (id, author_id, content, cover_image, created_at, published_at, status, summary, title, updated_at, contest_id) VALUES
(1, 1, 'Nhiếp ảnh phim không chỉ là bấm máy mà là nghệ thuật quan sát kiên nhẫn. Trong cuộc thi Analog Moments 2026, ban giám khảo đánh giá cao tính chân thực và kỹ thuật phơi sáng thủ công của các thí sinh...', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80', NOW(), NOW(), 'PUBLISHED', 'Chia sẻ của Giám khảo về tiêu chí đánh giá tác phẩm phim xuất sắc.', 'Bí quyết chụp ảnh phim chân thật & giàu cảm xúc', NOW(), 1),
(2, 1, 'Kỹ thuật chọn phim đen trắng ISO 400 cho nhiếp ảnh đường phố giúp kiểm soát hạt phim mịn và tương phản ánh sáng gắt...', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', NOW(), NOW(), 'PUBLISHED', 'Hướng dẫn kỹ thuật chụp monochrome và lưu ý khi tráng phim.', 'Nghệ thuật tương phản qua cuộn phim đen trắng', NOW(), 5),
(3, 2, 'Tổng kết cuộc thi Black & White Stories 2026 với hơn 600 bài thi ấn tượng. Cùng nhìn lại các tác phẩm đoạt giải cao nhất...', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80', NOW(), NOW(), 'PUBLISHED', 'Nhìn lại hành trình cảm xúc của cuộc thi phim đen trắng vừa qua.', 'Công bố tác phẩm xuất sắc Black & White Stories 2026', NOW(), 5);

-- Kho lưu trữ số tác phẩm đoạt giải (Digital Archives)
INSERT IGNORE INTO digital_archives (id, archive_year, author_id, award_name, created_at, description, image_url, title, contest_id) VALUES
(1, 2026, 1, 'Giải Nhất', NOW(), 'Tác phẩm đoạt giải Nhất cuộc thi Black & White Stories 2026. Phim Ilford HP5 400.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', 'Gánh Hàng Rong Phố Cổ', 5),
(2, 2026, 2, 'Giải Nhì', NOW(), 'Tác phẩm đoạt giải Nhì cuộc thi Black & White Stories 2026. Phim Kodak Tri-X 400.', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80', 'Bước Chân Qua Cầu Cũ', 5),
(3, 2026, 1, 'Giải Ba', NOW(), 'Tác phẩm giải Ba cuộc thi Spring Film Diary 2026.', 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80', 'Sắc Xuân Vùng Cao', 10),
(4, 2025, 2, 'Giải Nhất', NOW(), 'Tác phẩm giải Nhất cuộc thi ảnh đường phố thường niên 2025.', 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80', 'Góc Phố Trầm Mặc', 2);

-- Đăng ký tham gia (Contest Registrations)
INSERT IGNORE INTO contest_registrations (id, note, registered_at, reviewed_at, status, user_id, contest_id) VALUES
(1, 'Đăng ký tham gia hạng mục ảnh đời sống', NOW(), NOW(), 'APPROVED', 1, 1),
(2, 'Đăng ký tham gia ảnh đường phố thành phố', NOW(), NOW(), 'APPROVED', 2, 2),
(3, 'Đăng ký tham gia chụp ảnh cổ điển', NOW(), NULL, 'PENDING', 1, 3);
