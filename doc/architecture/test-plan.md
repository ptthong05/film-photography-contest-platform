# KẾ HOẠCH KIỂM THỬ (TEST PLAN v1.0)

## 1. Giới thiệu
Tài liệu này định nghĩa chiến lược kiểm thử cho Nền tảng quản lý cuộc thi nhiếp ảnh phim tích hợp AI. Mục tiêu là đảm bảo tính ổn định, quản lý siêu dữ liệu (metadata) an toàn và độ chính xác của các thuật toán xác minh AI.

## 2. Phạm vi kiểm thử
Kiểm thử sẽ bao phủ toàn bộ Ứng dụng Web, Ứng dụng Mobile, Backend API và Module AI.

## 3. Phân loại kiểm thử

### 3.1. Kiểm thử chức năng (Functional Testing - Các luồng chính)
1. **Lên kế hoạch cuộc thi (Contest Planning)**: Xác minh Organizer có thể tạo cuộc thi với lịch trình và tiêu chí chấm điểm động (dynamic).
2. **Nộp bài dự thi (Film Submission)**: 
   - Kiểm tra Participant có thể upload ảnh thành công.
   - Bắt buộc kiểm tra việc nhập đủ các metadata nhiếp ảnh phim (loại phim, máy, lens, ISO...) và đảm bảo chúng được lưu chính xác.
3. **Xác minh bài thi (Manual & AI)**:
   - Đưa cố tình các ảnh do AI tạo ra để kiểm tra xem Module AI có cắm cờ (flag) chính xác không.
   - Đưa các ảnh giống hệt nhau để test tính năng Image Similarity Detection.
   - Kiểm tra Organizer có thể duyệt tay (override) các cảnh báo của AI.
4. **Chấm thi (Judging)**: Đảm bảo Judge xem được đúng ảnh được phân công, chấm điểm theo các tiêu chí đã cài đặt (grain phim, bố cục...) và nộp kết quả an toàn.
5. **Kho lưu trữ (Digital Archive)**: Đảm bảo sau khi đóng cuộc thi, ảnh đạt giải sẽ tự động được public lên kho lưu trữ số kèm toàn bộ metadata.

### 3.2. Kiểm thử phi chức năng (Non-Functional Testing)
1. **Bảo mật & Phân quyền**:
   - Kiểm tra quá trình sinh và hết hạn của token JWT.
   - Kiểm thử RBAC (Phân quyền): Thí sinh không thể truy cập giao diện Giám khảo; Ban tổ chức không thể sửa đổi Master Data của Admin.
2. **Hiệu năng & Tải (Performance & Scalability)**:
   - Load test khi hệ thống đang chạy song song hàng chục cuộc thi.
   - Test việc nhiều giám khảo cùng chấm điểm tại một thời điểm để đảm bảo DB không bị khóa/nghẽn (deadlock) khi tính tổng điểm.
3. **Xác thực Cloud Storage**: Đảm bảo các file ảnh scan siêu nét dung lượng lớn không bị lỗi khi upload/download từ Firebase hoặc Azure Blob Storage.
