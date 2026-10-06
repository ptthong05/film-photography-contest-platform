# THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE DESIGN)

## 1. Tổng quan
Cơ sở dữ liệu được thiết kế để xử lý các dữ liệu metadata phức tạp của nhiếp ảnh phim, quản lý cấu hình đa dạng của các cuộc thi và lưu trữ số hóa (Digital Archive). Cấu trúc này dễ dàng tương thích với cả MongoDB (NoSQL) hoặc PostgreSQL/MySQL (Relational).

## 2. Các thực thể cốt lõi (Core Entities)

### 2.1. Users (Người dùng)
- `id`: Khóa chính (Primary Key)
- `email`: Chuỗi (Duy nhất)
- `passwordHash`: Chuỗi (Mật khẩu mã hóa)
- `role`: Kiểu liệt kê (ADMIN, ORGANIZER, JUDGE, PARTICIPANT)
- `profile`: Chi tiết hồ sơ (Tên, Tiểu sử, Link Portfolio).

### 2.2. Contests (Cuộc thi)
- `id`: Khóa chính
- `theme`: Chuỗi (Chủ đề cuộc thi)
- `categories`: Mảng chuỗi (Các hạng mục)
- `submissionPeriod`: Khoảng thời gian (Thời gian nộp bài)
- `judgingSchedule`: Khoảng thời gian (Thời gian chấm điểm)
- `evaluationCriteria`: Mảng/JSON (Các tiêu chí chấm điểm, ví dụ: [sáng tạo nghệ thuật, bố cục, truyền tải câu chuyện, kỹ thuật, grain phim, dải tông màu, màu sắc, chất lượng scan])
- `awardStructure`: Chuỗi (Cơ cấu giải thưởng)
- `regulations`: Văn bản (Quy định cuộc thi)

### 2.3. Submissions (Bài dự thi)
- `id`: Khóa chính
- `contestId`: Khóa ngoại -> Contests
- `participantId`: Khóa ngoại -> Users
- `imageFileUrl`: Chuỗi (Link ảnh lưu trên Cloud Storage)
- `technicalMetadata`: Object JSON (Thông tin kỹ thuật)
  - `filmBrand`: Hãng phim
  - `filmStock`: Loại phim
  - `iso`: Số nguyên
  - `camera`: Máy ảnh
  - `lens`: Ống kính
  - `frameNumber`: Chuỗi (Số khung hình)
  - `shootingLocation`: Địa điểm chụp
  - `developingLaboratory`: Lab tráng rửa
  - `scanningSpecifications`: Thông số scan
- `status`: Kiểu liệt kê (PENDING, VERIFIED, REJECTED)
- `aiVerification`: Object JSON (Cờ cảnh báo từ AI)
  - `isDuplicate`: Boolean (Có phải ảnh trùng lặp không)
  - `isAiGenerated`: Boolean (Có phải ảnh AI không)
  - `similarityScore`: Số thực (Điểm tương đồng)
  - `autoTags`: Mảng chuỗi (Các tag tự động nhận diện)

### 2.4. Evaluations (Đánh giá / Chấm điểm)
- `id`: Khóa chính
- `submissionId`: Khóa ngoại -> Submissions
- `judgeId`: Khóa ngoại -> Users
- `scores`: Object JSON (Điểm cho từng tiêu chí)
- `totalScore`: Số thực (Tổng điểm)
- `comments`: Văn bản (Nhận xét của giám khảo)
- `round`: Số nguyên (Vòng chấm)

### 2.5. DigitalArchive (Kho lưu trữ số)
- Chứa các bản ghi tối ưu hóa cho việc đọc nhanh của các tác phẩm đạt giải, bao gồm hình ảnh, nhận xét của giám khảo và dữ liệu lịch sử cuộc thi nhằm phục vụ triển lãm công cộng và giáo dục.
