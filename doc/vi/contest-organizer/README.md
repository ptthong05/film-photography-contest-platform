# Hướng dẫn dành cho Ban tổ chức (Contest Organizer)

## 1. Tổng quan
Người tổ chức cuộc thi (Organizer) là người vận hành chính của một giải đấu. Họ chịu trách nhiệm từ khâu tạo giải đến khi công bố kết quả.

## 2. Các chức năng chính (Dựa trên Sơ đồ luồng 3.3)

### 2.1. Tạo và Cấu hình cuộc thi
- Khởi tạo cuộc thi mới: Chủ đề, thể loại, thời gian nộp bài, thời gian chấm, địa điểm, giải thưởng.
- Hệ thống lưu thông tin vào CSDL.

### 2.2. Quản lý đăng ký & Phân công Judge
- Xem danh sách Participant đăng ký tham gia.
- Cập nhật danh sách tham gia.
- Phân công Giám khảo (Judge) chấm các bài dự thi.

### 2.3. Kiểm tra & Xác minh bài dự thi
- Kiểm tra tính hợp lệ của bài nộp (Format, chất lượng ảnh, hạn chót).
- Kiểm tra tính đầy đủ của siêu dữ liệu nhiếp ảnh (Metadata: Film stock, ISO, Lens...).
- **Tương tác với AI:** Hệ thống AI tự động phát hiện ảnh trùng lặp hoặc ảnh do AI tạo ra. Organizer sẽ kiểm tra thủ công (Manual review) nếu AI cắm cờ cảnh báo.

### 2.4. Công bố kết quả & Quản lý giải thưởng
- Xác nhận kết quả từ giám khảo.
- Công bố kết quả tạm thời / chính thức.
- Tổ chức triển lãm trực tuyến (Online exhibition).
- Đẩy các bài dự thi đạt giải vào Kho lưu trữ số (Digital Archive).
