# THIẾT KẾ API (API DESIGN)

## 1. Tổng quan
Tài liệu này phác thảo các RESTful API cốt lõi cho Nền tảng quản lý cuộc thi nhiếp ảnh phim tích hợp AI. Các API tuân theo chuẩn REST và sử dụng JWT để xác thực (Kiểm soát truy cập dựa trên vai trò - RBAC).

## 2. Xác thực (Authentication)
- `POST /api/auth/login`: Đăng nhập và trả về token JWT.
- `POST /api/auth/register`: Đăng ký tài khoản Participant mới (Thí sinh).

## 3. Quản lý cuộc thi (Organizer & Admin)
- `GET /api/contests`: Lấy danh sách tất cả các cuộc thi đang diễn ra.
- `POST /api/contests`: Tạo cấu hình cuộc thi mới (Chủ đề, hạng mục, lịch chấm).
- `GET /api/contests/{id}`: Xem chi tiết một cuộc thi.

## 4. Nộp bài dự thi (Participant)
- `POST /api/submissions`: Upload file ảnh kèm thông tin kỹ thuật máy phim.
  - **Payload (Multipart/form-data)**: 
    - `file`: File hình (ảnh scan).
    - `filmStock`: Chuỗi (Ví dụ: Kodak Portra 400).
    - `camera`: Chuỗi (Ví dụ: Canon AE-1).
    - `lens`: Chuỗi.
    - `iso`: Số.
    - `format`: Chuỗi (Ví dụ: 35mm, 120).
    - `frameNumber`: Số.
    - `developingLab`: Chuỗi.
    - `scanningSpecs`: Chuỗi.

## 5. Xác minh bài dự thi (Organizer & AI Module)
- `POST /api/ai/verify`: Webhook nội bộ để Module AI gửi cờ báo cáo ảnh trùng lặp hoặc ảnh AI sinh ra.
- `PATCH /api/submissions/{id}/status`: Phê duyệt hoặc từ chối bài dự thi bằng tay (Manual Review).

## 6. Đánh giá chấm thi (Judge)
- `GET /api/evaluations/assigned`: Lấy danh sách bài thi được phân công cho vị giám khảo hiện tại.
- `POST /api/evaluations`: Nộp điểm số và nhận xét dựa trên các tiêu chí cấu hình sẵn (sáng tạo, bố cục, grain phim, v.v.).

## 7. Kho lưu trữ số (Digital Archive)
- `GET /api/archive`: Truy xuất danh sách ảnh đoạt giải và dữ liệu lịch sử các cuộc thi cũ.
