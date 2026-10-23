# THIẾT KẾ API (API DESIGN)

## 1. Tổng quan
Tài liệu này phác thảo các RESTful API cốt lõi cho Nền tảng quản lý cuộc thi nhiếp ảnh phim tích hợp AI. Các API tuân theo chuẩn REST và sử dụng JWT để xác thực (Kiểm soát truy cập dựa trên vai trò - RBAC).

## 2. Xác thực (Authentication)
- `POST /api/auth/login`: Đăng nhập bằng email **hoặc** số điện thoại, trả về token JWT.
  - Body: `{ "identifier": "admin@filmcontest.vn", "password": "..." }`
  - Response: `{ "token": "...", "expiresAt": "...", "user": { "id", "name", "email", "phone", "role", "status", ... } }`
  - `401` sai thông tin đăng nhập · `403` tài khoản bị khóa.
- `POST /api/auth/register`: Đăng ký tài khoản Participant mới (Thí sinh). Luôn tạo role `PARTICIPANT`,
  bỏ qua mọi `role` client gửi lên. Trả về giống `login` (đăng ký xong là đăng nhập luôn).
  - Body: `{ "name", "email", "phone", "password" }`
- `GET /api/auth/me`: Thông tin tài khoản đang đăng nhập.

Mọi API khác cần header `Authorization: Bearer <token>`. Thiếu / sai token → `401`, sai role → `403`,
cùng định dạng `{ "message": "..." }`.

### Quản lý người dùng (chỉ Admin)
- `GET /api/users`, `GET /api/users/{id}`
- `POST /api/users`: Tạo tài khoản bất kỳ role (dùng để tạo Organizer / Judge). Bắt buộc `password`.
- `PUT /api/users/{id}`: Sửa thông tin; để trống `password` = giữ mật khẩu cũ.
- `PATCH /api/users/{id}/status`: Khóa / mở khóa — body `{ "status": "ACTIVE" | "SUSPENDED" | "LOCKED" }`.
- `DELETE /api/users/{id}`
- Admin không thể tự khóa, tự xóa hoặc tự hạ quyền của chính mình.

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
