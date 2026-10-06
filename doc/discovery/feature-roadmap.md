# LỘ TRÌNH PHÁT TRIỂN TÍNH NĂNG (FEATURE ROADMAP)

Dự án Nền tảng quản lý cuộc thi nhiếp ảnh phim sẽ được chia thành 4 giai đoạn phát triển chính để đảm bảo tiến độ và chất lượng.

## Giai đoạn 1: Core Platform & Web Portal (Tháng 1 - Tháng 2)
Mục tiêu: Xây dựng nền tảng cơ bản cho Ban tổ chức và Thí sinh.
- Thiết kế và thiết lập Cơ sở dữ liệu (PostgreSQL/MongoDB).
- Xây dựng hệ thống xác thực (Authentication & Authorization bằng JWT).
- Phát triển tính năng: Quản lý hồ sơ người dùng (Profiles).
- Phát triển luồng: Ban tổ chức (Organizer) tạo cuộc thi và thiết lập tiêu chí chấm.
- Phát triển luồng: Thí sinh (Participant) đăng ký tham gia và nộp ảnh qua Web (kèm nhập thủ công thông số film stock, camera, lens...).

## Giai đoạn 2: Mobile App & Judging System (Tháng 3)
Mục tiêu: Tăng tính tiện dụng cho thí sinh và xây dựng phân hệ chấm thi.
- Phát triển ứng dụng Mobile (Flutter) cho Thí sinh nộp ảnh tiện lợi hơn.
- Phát triển Portal cho Giám khảo (Judge): Xem ảnh được phân công, chấm điểm, nhận xét.
- Luồng tính tổng điểm tự động và xếp hạng bài thi.

## Giai đoạn 3: AI Integration & Computer Vision (Tháng 4)
Mục tiêu: Tích hợp Trí tuệ nhân tạo để giảm tải công việc xác minh.
- Triển khai Module AI độc lập (Python/FastAPI).
- Tính năng: **Image Similarity Detection** (Phát hiện ảnh trùng lặp trong hệ thống).
- Tính năng: **AI-generated Image Detection** (Cảnh báo ảnh được tạo ra bằng AI để chống gian lận).
- Tự động gán nhãn (Auto-categorization) cho ảnh.

## Giai đoạn 4: Digital Archive & Analytics (Tháng 5)
Mục tiêu: Lưu trữ dài hạn và thống kê.
- Xây dựng Kho lưu trữ số (Digital Archive) public các tác phẩm đạt giải ra công chúng.
- Báo cáo thống kê cho Organizer (Loại phim nào được dùng nhiều nhất, hãng máy ảnh phổ biến...).
- Đóng gói, kiểm thử toàn diện và triển khai (Deploy) lên Microsoft Azure.
