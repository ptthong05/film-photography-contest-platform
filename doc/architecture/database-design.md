# THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE DESIGN)

## 1. Tổng quan

- **Hệ quản trị:** MongoDB (database `film_photography_contest_management_db`).
- **Code tương ứng:** mỗi collection là một class trong `backend/src/main/java/com/example/backend/entity/`,
  truy vấn qua repository cùng tên trong `repository/`. Index được Spring tạo tự động khi khởi động
  (`spring.data.mongodb.auto-index-creation=true`).
- **Trường chung** (class `BaseDocument`): mọi document đều có `_id`, `createdAt`, `updatedAt`
  (tự điền bởi Mongo auditing).
- **Nguyên tắc thiết kế:**
  - Dữ liệu luôn đọc cùng cha thì **nhúng** (vòng chấm, tiêu chí, giải thưởng nằm trong `contests`;
    metadata ảnh nằm trong `contest_submissions`).
  - Dữ liệu tăng không giới hạn hoặc truy vấn độc lập thì **tách collection** và tham chiếu bằng id
    (bài dự thi, phiếu chấm, thông báo...).
  - Ảnh lưu trên Cloud Storage (Firebase / Azure Blob), database **chỉ giữ URL**.
  - Mật khẩu chỉ lưu **BCrypt hash** (`passwordHash`), không bao giờ trả ra API.

## 2. Sơ đồ quan hệ

```text
users ─┬─< contests (organizerId)
       ├─< contest_registrations (participantId) >── contests
       ├─< judge_assignments (judgeId) >──────────── contests
       ├─< contest_submissions (participantId) >──── contests
       ├─< evaluations (judgeId) >────────────────── contest_submissions
       ├─< notifications (recipientId)
       └─< activity_logs (actorId)

contest_submissions ──1:1── archive_entries (khi đạt giải và công bố kết quả)
master_data: danh mục độc lập (hãng phim, máy ảnh, ống kính...)
```

## 3. Phân quyền (Role) và trạng thái tài khoản

| Role          | Ai tạo tài khoản                                   | Trang frontend   |
| ------------- | -------------------------------------------------- | ---------------- |
| `ADMIN`       | Tự tạo khi backend khởi động lần đầu (xem mục 5)   | `#/admin`        |
| `ORGANIZER`   | Admin tạo qua `POST /api/users`                    | `#/organizer`    |
| `JUDGE`       | Admin tạo qua `POST /api/users`                    | `#/judge`        |
| `PARTICIPANT` | Tự đăng ký qua `POST /api/auth/register`           | `#/participant`  |

`UserStatus`: `ACTIVE` (đăng nhập được) · `SUSPENDED` (tạm khóa) · `LOCKED` (bị khóa).
Tài khoản không `ACTIVE` không đăng nhập được và token cũ bị từ chối ngay lập tức.

## 4. Các collection

### 4.1. `users` — Người dùng (cả 4 role)

| Trường             | Kiểu             | Ghi chú                                                    |
| ------------------ | ---------------- | ---------------------------------------------------------- |
| `name`             | String           |                                                            |
| `email`            | String           | **unique**, luôn lưu chữ thường                            |
| `phone`            | String           | **unique (sparse)**, dạng `0xxxxxxxxx`, đăng nhập thay email |
| `passwordHash`     | String           | BCrypt                                                     |
| `role`             | Role             | index                                                      |
| `status`           | UserStatus       | mặc định `ACTIVE`                                          |
| `avatarUrl`, `bio`, `portfolioUrl` | String |                                                     |
| `specialty`        | String           | Chuyên môn (Judge)                                         |
| `organizationName` | String           | Tên CLB / trường / lab (Organizer)                         |
| `gear`             | GearItem[]       | Bộ đồ nghề lưu sẵn (Participant): `{type, name}`, type = `CAMERA` / `LENS` / `FILM_STOCK` |
| `lastLoginAt`      | Instant          |                                                            |

### 4.2. `contests` — Cuộc thi

| Trường                    | Kiểu                | Ghi chú                                          |
| ------------------------- | ------------------- | ------------------------------------------------ |
| `title`, `theme`, `description`, `coverUrl`, `regulations` | String |                            |
| `slug`                    | String              | **unique**, dùng cho đường dẫn                   |
| `categories`              | String[]            | Hạng mục                                         |
| `organizerId`             | → users             | index                                            |
| `status`                  | ContestStatus       | `DRAFT` → `UPCOMING` → `ONGOING` → `JUDGING` → `ENDED`, index |
| `submissionStart/End`     | Instant             | Thời gian nhận bài                               |
| `judgingStart/End`        | Instant             | Thời gian chấm                                   |
| `maxPhotosPerParticipant` | int                 | mặc định 1                                       |
| `anonymousJudging`        | boolean             | Bật thì giám khảo không thấy tên tác giả         |
| `rounds`                  | JudgingRound[]      | `{id, name, order, startDate, endDate}`          |
| `criteria`                | JudgingCriterion[]  | `{id, name, description, maxScore, weight}` — tổng `weight` = 100 |
| `awards`                  | Award[]             | `{rank, title, reward, quantity}`                |
| `resultPublishedAt`       | Instant             | `null` = chưa công bố kết quả                    |

### 4.3. `contest_registrations` — Đăng ký tham gia

| Trường          | Kiểu               | Ghi chú                                  |
| --------------- | ------------------ | ---------------------------------------- |
| `contestId`     | → contests         |                                          |
| `participantId` | → users            | index                                    |
| `status`        | RegistrationStatus | `PENDING` / `APPROVED` / `REJECTED`      |
| `note`          | String             | Lý do từ chối                            |

Unique: (`contestId`, `participantId`) — mỗi thí sinh đăng ký 1 lần / cuộc thi.

### 4.4. `judge_assignments` — Phân công giám khảo

| Trường          | Kiểu        | Ghi chú                                              |
| --------------- | ----------- | ---------------------------------------------------- |
| `contestId`     | → contests  |                                                      |
| `roundId`       | → contests.rounds.id |                                             |
| `judgeId`       | → users     | index                                                |
| `assignedBy`    | → users     | Người phân công                                      |
| `submissionIds` | String[]    | Rỗng = chấm toàn bộ bài của vòng                     |

Unique: (`contestId`, `roundId`, `judgeId`).

### 4.5. `contest_submissions` — Bài dự thi

| Trường            | Kiểu             | Ghi chú                                                  |
| ----------------- | ---------------- | -------------------------------------------------------- |
| `contestId`       | → contests       |                                                          |
| `participantId`   | → users          | index                                                    |
| `title`, `description`, `category` | String |                                                  |
| `imageUrls`       | String[]         | Ảnh scan gốc trên Cloud Storage                          |
| `thumbnailUrls`   | String[]         | Ảnh thu nhỏ, cùng thứ tự với `imageUrls`                 |
| `negativeUrls`    | String[]         | Ảnh chụp âm bản (chứng minh là ảnh phim)                 |
| `contactSheetUrl` | String           |                                                          |
| `metadata`        | FilmMetadata     | `filmBrand, filmStock, iso, camera, lens, filmFormat, frameNumber, shootingDate, shootingLocation, developingLab, scanSpec` — lưu dạng chuỗi (snapshot) để bài cũ không đổi khi danh mục bị sửa |
| `status`          | SubmissionStatus | `PENDING` / `VERIFIED` / `REJECTED`                      |
| `rejectionReason` | String           |                                                          |
| `aiVerification`  | AiVerification   | `{duplicate, aiGenerated, similarityScore, duplicateOfSubmissionId, autoTags, checkedAt}`, `null` = AI chưa kiểm tra |
| `totalScore`      | Double           | Trung bình các phiếu chấm `FINALIZED`                    |
| `prizeRank`       | PrizeRank        | `FIRST` / `SECOND` / `THIRD` / `HONORABLE`, `null` = không đạt giải |

Index: (`contestId`, `status`).

### 4.6. `evaluations` — Phiếu chấm

| Trường         | Kiểu             | Ghi chú                                          |
| -------------- | ---------------- | ------------------------------------------------ |
| `submissionId` | → contest_submissions |                                             |
| `contestId`    | → contests       | Lặp lại để lọc theo cuộc thi không cần join, index |
| `roundId`      | → contests.rounds.id |                                              |
| `judgeId`      | → users          | index                                            |
| `scores`       | CriterionScore[] | `{criterionId, score}`                           |
| `totalScore`   | double           | Tổng có trọng số theo `contests.criteria`        |
| `comment`      | String           | Nhận xét gửi thí sinh                            |
| `privateNote`  | String           | Ghi chú riêng của giám khảo                      |
| `status`       | EvaluationStatus | `DRAFT` (còn sửa) / `FINALIZED` (đã chốt)        |
| `finalizedAt`  | Instant          |                                                  |

Unique: (`submissionId`, `roundId`, `judgeId`) — mỗi giám khảo chấm 1 bài 1 lần / vòng.

### 4.7. `archive_entries` — Kho lưu trữ số

Bản sao **tối ưu để đọc** của tác phẩm đạt giải, phục vụ trang công khai (Kho ảnh đạt giải, Bảng xếp hạng)
không cần join. Tạo khi Organizer công bố kết quả.

| Trường            | Kiểu           | Ghi chú                                |
| ----------------- | -------------- | -------------------------------------- |
| `submissionId`    | → contest_submissions | **unique**                      |
| `contestId`, `contestTitle`, `year` |  | `contestId`, `year` có index      |
| `participantId`, `authorName` |    | `participantId` có index               |
| `title`, `description`, `imageUrl`, `thumbnailUrl` | String |                     |
| `prizeRank`       | PrizeRank      |                                        |
| `totalScore`      | Double         |                                        |
| `metadata`        | FilmMetadata   |                                        |
| `judgeComments`   | JudgeComment[] | `{judgeId, judgeName, comment}`        |

### 4.8. `master_data` — Danh mục dùng chung (Admin quản lý)

| Trường   | Kiểu           | Ghi chú                                                              |
| -------- | -------------- | -------------------------------------------------------------------- |
| `type`   | MasterDataType | `FILM_STOCK` / `CAMERA` / `LENS` / `FILM_FORMAT` / `DEVELOPING_LAB` |
| `name`   | String         |                                                                      |
| `brand`  | String         |                                                                      |
| `active` | boolean        | Ẩn khỏi dropdown thay vì xóa, để bài cũ vẫn hợp lệ                   |

Unique: (`type`, `name`).

### 4.9. `notifications` — Thông báo

`recipientId` (→ users), `type` (`ASSIGNMENT`, `DEADLINE`, `NEW_SUBMISSION`, `CRITERIA_UPDATE`,
`SUBMISSION_STATUS`, `RESULT_PUBLISHED`), `title`, `message`, `link` (hash frontend), `read`.
Index: (`recipientId`, `read`, `createdAt` giảm dần).

### 4.10. `activity_logs` — Nhật ký thao tác

`actorId` (→ users, `null` = hệ thống), `actorRole`, `action` (vd. `USER_LOCKED`, `CONTEST_CREATED`),
`targetType`, `targetId`, `details`. Chỉ thêm mới, không sửa / xóa.

## 5. Tài khoản Admin đầu tiên

Admin không tự đăng ký được. Khi backend khởi động mà DB **chưa có Admin nào**, `AdminAccountInitializer`
tự tạo tài khoản:

- Email: biến môi trường `ADMIN_EMAIL` (mặc định `admin@filmcontest.vn`).
- Mật khẩu: biến `ADMIN_PASSWORD`. Nếu không đặt, backend **sinh mật khẩu ngẫu nhiên và in ra log một lần**
  — hãy lưu lại ngay.

Với database dùng chung của nhóm, chỉ người khởi động backend đầu tiên thấy mật khẩu này.
