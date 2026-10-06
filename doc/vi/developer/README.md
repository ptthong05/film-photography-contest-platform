# Hướng dẫn dành cho Nhóm Phát triển (Developer)

## 1. Tổng quan
Tài liệu này cung cấp hướng dẫn về mặt kỹ thuật cho đội ngũ lập trình (Developers) của hệ thống "Quản lý cuộc thi nhiếp ảnh phim tích hợp AI".

## 2. Kiến trúc tổng thể
Hệ thống bao gồm các thành phần:
- **Frontend (Web):** ReactJS / Vite / TailwindCSS.
- **Frontend (Mobile):** Flutter.
- **Backend:** Spring Boot (Java) hoặc Node.js / ASP.NET.
- **Database:** MongoDB / PostgreSQL.
- **AI Module:** Python (FastAPI/Flask) cho Computer Vision.
- **Cloud Storage:** Firebase Storage hoặc Azure Blob.

## 3. Các luồng nghiệp vụ cần lập trình
Dựa vào sơ đồ chức năng, Developer cần lưu ý các luồng giao tiếp sau:
1. **Luồng Upload (Participant -> Storage):** Xử lý tải ảnh dung lượng lớn, trích xuất Exif cơ bản nếu có, lưu metadata vào DB.
2. **Luồng AI Verification (Backend <-> AI Module):** Khi ảnh được upload, Backend gọi webhook sang AI Module để thực hiện `Image Similarity Detection` và `AI-generated Detection`. Kết quả trả về được lưu vào `aiFlags` trong DB.
3. **Luồng Aggregation (Tính điểm):** Viết cronjob hoặc trigger để tổng hợp `totalScore` khi tất cả các Judges hoàn tất đánh giá.
4. **Luồng Archiving:** Tự động di chuyển (hoặc nhân bản) dữ liệu các tác phẩm thắng giải sang cấu trúc read-optimized của Digital Archive sau khi công bố kết quả.

## 4. Bảo mật & Tiêu chuẩn
- Sử dụng **JWT** cho toàn bộ API endpoints. Triển khai Middleware kiểm tra Role (RBAC).
- Tuân thủ cấu trúc thư mục (Controller -> Service -> Repository) như đã đề ra. Mọi business logic phức tạp phải nằm trong thư mục `service`.
