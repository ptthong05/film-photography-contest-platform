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
- `PUT /api/auth/me`: Tự sửa họ tên / email / SĐT (mọi role) — body `{ "name", "email", "phone" }`.
  Email / SĐT trùng tài khoản khác → `409`.

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
Mọi API trong mục này yêu cầu role `JUDGE` (sai role → `403`). Đường dẫn khớp với
`src/frontend/src/services/judgeService.ts` để khi nối backend chỉ thay thân hàm service, component không đổi.

**Quy tắc chung**
- Judge chỉ thấy bài thuộc phạm vi được phân công trong `judge_assignments`
  (`submissionIds` rỗng = toàn bộ bài `VERIFIED` của vòng). Bài ngoài phạm vi trả `404`, không trả `403`,
  để không lộ bài có tồn tại.
- Cuộc thi bật `anonymousJudging` → `authorName` luôn là `null`, không trả `participantId`.
- `totalScore` do backend tính theo `contests.criteria`, không nhận từ client.
- Lỗi dùng chung định dạng `{ "message": "..." }`.

### 6.1. Hồ sơ & tổng quan
- `GET /api/judges/me`: Hồ sơ giám khảo đang đăng nhập.
  - Response: `{ "id", "fullName", "email", "phone", "specialty", "yearsOfExperience", "bio", "avatarUrl" }`
- `PATCH /api/judges/me`: Sửa thông tin chuyên môn — body `{ "specialty", "yearsOfExperience", "bio" }`.
  Họ tên / email / SĐT là thông tin đăng nhập nên sửa qua `PUT /api/auth/me`.
- `GET /api/judges/me/stats`: Số liệu trang Tổng quan.
  - Response: `{ "assignedContests", "pendingSubmissions", "evaluatedSubmissions", "awaitingNextRound" }`

### 6.2. Cuộc thi được phân công
- `GET /api/judges/me/contests`: Các cuộc thi giám khảo có ít nhất 1 phân công.
  - Response: mảng `{ "id", "title", "coverUrl", "startDate", "endDate", "status", "currentRound", "criteria", "assignedCount", "evaluatedCount", "isResultPublished" }`
  - `status` là tiến độ chấm của giám khảo (`NOT_STARTED` / `JUDGING` / `COMPLETED`), suy ra từ `contests.status`
    và thời gian vòng — xem mục 6.6.
  - `startDate` / `endDate` = `judgingStart` / `judgingEnd`; `isResultPublished` = `resultPublishedAt != null`.

### 6.3. Bài dự thi được phân công
- `GET /api/judges/me/submissions`: Danh sách bài được phân công (UC-J1).
  - Query (tùy chọn): `contestId`, `roundId`, `status` (`NOT_STARTED` / `DRAFT` / `FINALIZED`).
  - Response: mảng `{ "id", "contestId", "contestTitle", "roundId", "roundName", "title", "authorName", "category", "description", "submittedAt", "imageUrls", "thumbnailUrls", "negativeUrls", "contactSheetUrl", "metadata", "evaluationStatus", "totalScore", "evaluatedAt" }`
  - `evaluationStatus` / `totalScore` / `evaluatedAt` là phiếu chấm **của chính giám khảo này**;
    `totalScore`, `evaluatedAt` = `null` khi phiếu chưa `FINALIZED`.
- `GET /api/judges/me/submissions/{submissionId}`: Chi tiết 1 bài, cùng cấu trúc. `404` nếu không được phân công.

### 6.4. Phiếu chấm
- `GET /api/judges/me/submissions/{submissionId}/evaluation`: Phiếu chấm hiện tại của giám khảo cho bài này
  ở vòng hiện tại. Chưa chấm → `200` với body `null`.
  - Response: `{ "submissionId", "roundId", "scores": [{ "criterionId", "score" }], "comment", "privateNote", "recommendNextRound", "status", "totalScore", "updatedAt" }`
- `PUT /api/judges/me/submissions/{submissionId}/evaluation`: Lưu nháp hoặc gửi chính thức (UC-J3).
  Tạo mới nếu chưa có, cập nhật nếu đang `DRAFT`.
  - Body: `{ "scores": [{ "criterionId", "score" }], "comment", "privateNote", "recommendNextRound", "isFinal" }`
  - `isFinal: false` → lưu `DRAFT`, cho phép thiếu điểm / nhận xét.
  - `isFinal: true` → bắt buộc đủ điểm mọi tiêu chí và `comment` không rỗng; phiếu chuyển `FINALIZED`,
    ghi `finalizedAt`, cập nhật lại `contest_submissions.totalScore` (trung bình các phiếu `FINALIZED`).
  - Mỗi `score` nằm trong `[1, maxScore]` của tiêu chí và chia hết cho bước điểm (mục 6.6);
    `criterionId` phải thuộc `criteria` của cuộc thi; `comment` tối đa 1000 ký tự.
  - Lỗi: `400` dữ liệu không hợp lệ · `404` bài không được phân công · `409` phiếu đã `FINALIZED`
    · `422` ngoài thời gian chấm của vòng.
  - Ghi theo unique index (`submissionId`, `roundId`, `judgeId`) để nhiều giám khảo chấm đồng thời không tạo
    phiếu trùng; cập nhật `totalScore` của bài bằng thao tác atomic, không khóa cả cuộc thi.
- `GET /api/judges/me/submissions/{submissionId}/evaluation-history`: Các phiếu `FINALIZED` của giám khảo
  cho bài này qua các vòng, sắp theo thứ tự vòng.
  - Response: mảng `{ "roundName", "totalScore", "comment", "recommendNextRound", "evaluatedAt" }`
- `GET /api/judges/me/evaluations`: Toàn bộ phiếu chấm của giám khảo (trang Kết quả / Thống kê).
  - Query (tùy chọn): `contestId`, `status`.

### 6.5. Kết quả & thông báo
- `GET /api/contests/{contestId}/results`: Bảng xếp hạng chung cuộc. Chỉ có dữ liệu sau khi Organizer
  công bố (`resultPublishedAt != null`); chưa công bố → mảng rỗng.
  - Response: mảng `{ "rank", "submissionTitle", "authorName", "averageScore", "award" }`
- `GET /api/notifications`: Thông báo của người đang đăng nhập (dùng chung mọi role).
  - Response: mảng `{ "id", "type", "message", "createdAt", "isRead" }`
- `PATCH /api/notifications/read-all`: Đánh dấu tất cả đã đọc.

### 6.6. Cần nhóm chốt trước khi làm backend
| # | Vấn đề | Đề xuất |
|---|---|---|
| 1 | Thời điểm được chấm chưa có quy tắc | Chỉ cho `PUT .../evaluation` khi `contests.status = JUDGING` và thời điểm hiện tại nằm trong `startDate`–`endDate` của vòng |
| 2 | Trạng thái cuộc thi: DB dùng `DRAFT/UPCOMING/ONGOING/JUDGING/ENDED`, Judge UI dùng `NOT_STARTED/JUDGING/COMPLETED` | Giữ enum DB; API Judge trả trạng thái suy ra: `JUDGING` → `JUDGING`, `ENDED` → `COMPLETED`, còn lại → `NOT_STARTED` |
| 3 | Thang điểm chưa quy định | Điểm tối thiểu 1, bước 0.5, điểm tổng quy về thang 10: `Σ(score / maxScore × weight) / Σweight × 10`, làm tròn 1 chữ số |
| 4 | Ẩn danh: UC-J1 ghi luôn ẩn danh, DB có cờ `anonymousJudging` theo cuộc thi | Giữ cờ theo cuộc thi, mặc định `true` |
| 5 | `recommendNextRound` có ở UI nhưng chưa có trong `evaluations` | Thêm trường `recommendNextRound: boolean` vào `evaluations` |
| 6 | `privateNote` có trong DB nhưng UI chưa có ô nhập | Giữ trong API; bổ sung ô "Ghi chú riêng" ở form chấm |
| 7 | Metadata: DB dùng `camera`, frontend dùng `cameraBody`; DB có `filmBrand` | API theo tên trường DB (`camera`, có `filmBrand`); sửa type frontend khi nối API |
| 8 | `yearsOfExperience` có ở UI nhưng `users` chưa có | Thêm trường vào `users` hoặc bỏ khỏi UI |
| 9 | Mở lại phiếu đã `FINALIZED` | Thêm API cho Organizer: `PATCH /api/evaluations/{id}/reopen` → phiếu về `DRAFT` |

## 7. Kho lưu trữ số (Digital Archive)
- `GET /api/archive`: Truy xuất danh sách ảnh đoạt giải và dữ liệu lịch sử các cuộc thi cũ.
