# CHÂN DUNG NGƯỜI DÙNG (USER PERSONAS)

Tài liệu này phác họa 4 nhóm người dùng (Roles) cốt lõi của nền tảng để định hướng thiết kế UI/UX và luồng nghiệp vụ.

---

## 1. Participant (Thí sinh / Nhiếp ảnh gia phim)
- **Đặc điểm:** Yêu thích nhiếp ảnh truyền thống (analog). Thường lưu trữ ảnh scan trên điện thoại hoặc máy tính cá nhân.
- **Nỗi đau (Pain points):** Các cuộc thi hiện tại bắt họ điền Google Form dài dòng, phải tự gõ lại thông tin máy ảnh, loại phim cho từng bức ảnh rất mệt mỏi. Không có nơi tổng hợp lại các giải thưởng họ từng tham gia.
- **Mong muốn (Needs):** 
  - Giao diện nộp bài mượt mà (cả Web và Mobile).
  - Có thể lưu sẵn bộ "Đồ nghề" (Gear) như máy ảnh, ống kính yêu thích để chọn nhanh bằng Dropdown khi nộp bài thay vì gõ tay.
  - Theo dõi được trạng thái bài thi của mình (Đã duyệt, Bị loại, Đạt giải).

## 2. Contest Organizer (Ban tổ chức cuộc thi)
- **Đặc điểm:** Các câu lạc bộ nhiếp ảnh, trường đại học hoặc lab tráng phim.
- **Nỗi đau (Pain points):** Tốn quá nhiều thời gian để kiểm tra xem file ảnh có hợp lệ không, có bị nộp trùng không. Khó khăn trong việc gom file ảnh để gửi cho ban giám khảo chấm.
- **Mong muốn (Needs):**
  - Tạo cấu hình cuộc thi nhanh chóng (dùng Template).
  - Hệ thống tự động xác minh bài thi (Nhờ AI chặn ngay ảnh rác, ảnh do AI vẽ).
  - Tự động hóa quá trình chia bài cho giám khảo và tính tổng điểm.

## 3. Judge (Giám khảo)
- **Đặc điểm:** Các nhiếp ảnh gia kỳ cựu, chuyên gia kỹ thuật hình ảnh. Có con mắt khắt khe về kỹ thuật tráng rửa và chất lượng scan.
- **Nỗi đau (Pain points):** Phải chấm hàng trăm bức ảnh qua file ZIP tải về máy và nhập điểm ra file Excel, rất dễ nhầm lẫn.
- **Mong muốn (Needs):**
  - Một giao diện Web tối màu (Dark mode) giúp tôn lên bức ảnh.
  - Khi xem ảnh, có thể bật/tắt nhanh khung thông tin kỹ thuật (Film stock, ISO, Lens) để đối chiếu.
  - Công cụ chấm điểm trực quan (thanh trượt) và có chỗ ghi chú (comment) riêng tư.

## 4. Administrator (Quản trị viên nền tảng)
- **Đặc điểm:** Đội ngũ vận hành kỹ thuật (IT/Dev).
- **Mong muốn (Needs):**
  - Quản lý Master Data (Ví dụ: Cập nhật danh sách các loại Phim mới ra mắt, danh sách máy ảnh cổ để Thí sinh chọn).
  - Giám sát băng thông, dung lượng Cloud Storage (do file ảnh scan thường rất nặng).
  - Phân quyền và khóa tài khoản vi phạm.
