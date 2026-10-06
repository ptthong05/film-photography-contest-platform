# CÁC CA SỬ DỤNG (USE CASES)

## 1. Nhóm Use Case: Quản trị hệ thống (Administrator)
- **UC-A1:** Quản lý tài khoản (Khóa/Mở khóa tài khoản có dấu hiệu gian lận).
- **UC-A2:** Quản lý Master Data (Thêm các loại Film Stock mới, Hãng máy ảnh mới vào cơ sở dữ liệu để Thí sinh chọn khi nộp bài).
- **UC-A3:** Xem log hệ thống và giám sát băng thông Cloud Storage.

## 2. Nhóm Use Case: Tổ chức giải (Contest Organizer)
- **UC-O1:** Tạo một cuộc thi nhiếp ảnh phim mới từ đầu.
- **UC-O2:** Tạo cuộc thi mới từ Template đã lưu.
- **UC-O3:** Phân công Giám khảo (Judge) vào từng hạng mục cụ thể.
- **UC-O4:** Xét duyệt thủ công (Approve/Reject) các bài thi bị hệ thống AI cắm cờ đỏ (Nghi ngờ ảnh AI hoặc ảnh chôm/trùng lặp).
- **UC-O5:** Nhấn nút chốt kết quả và đưa ảnh lên Digital Archive.

## 3. Nhóm Use Case: Chấm thi (Judge)
- **UC-J1:** Xem danh sách ảnh ẩn danh (Anonymous) được phân công chấm.
- **UC-J2:** Bật/Tắt bảng thông tin kỹ thuật (Metadata: ISO, Lens, Scan info) của bức ảnh để đánh giá yếu tố kỹ thuật.
- **UC-J3:** Kéo thanh trượt để chấm điểm cho từng tiêu chí và lưu Nhận xét (Comment) cho thí sinh.

## 4. Nhóm Use Case: Dự thi (Participant)
- **UC-P1:** Đăng ký tài khoản và thiết lập "Túi đồ nghề" (Gear) gồm các loại máy và ống kính đang sở hữu.
- **UC-P2:** Đăng ký tham gia một cuộc thi.
- **UC-P3:** Upload ảnh scan, chọn nhanh máy ảnh/ống kính từ "Túi đồ nghề" và nhập thông số lab tráng rửa.
- **UC-P4:** Xem trạng thái duyệt bài thi (Đang chờ, Đã duyệt, Bị loại do sai format).
- **UC-P5:** Xem chứng nhận/giải thưởng trên trang Profile cá nhân sau khi cuộc thi kết thúc.
