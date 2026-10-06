# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS - Software Requirements Specification)

## 1. Mục đích
Tài liệu này đặc tả chi tiết các yêu cầu để xây dựng "Nền tảng quản lý cuộc thi nhiếp ảnh phim tích hợp AI". Nền tảng nhằm số hóa quy trình tổ chức, nâng cao hiệu quả quản lý, chuẩn hóa công tác chấm điểm và xây dựng Kho lưu trữ số (Digital Archive) tập trung cho văn hóa nhiếp ảnh Analog.

## 2. Yêu cầu phi chức năng (Non-Functional Requirements)
- **Bảo mật & Phân quyền:** Xác thực hệ thống phải dùng chuẩn JWT. Có kiểm soát truy cập dựa trên vai trò (RBAC) nghiêm ngặt giữa Admin, Organizer, Judge và Participant.
- **Lưu trữ dữ liệu:** Do đặc thù file scan ảnh phim rất nặng (có thể lên tới 50MB/ảnh), mọi hình ảnh phải được lưu trữ an toàn, độc lập trên Cloud Storage (Firebase Storage / Azure Blob).
- **Hiệu năng & Khả năng mở rộng:** Kiến trúc phần mềm phải theo chuẩn modular. Phải hỗ trợ khả năng tải (Load) khi nhiều cuộc thi diễn ra cùng lúc và nhiều giám khảo thao tác chấm điểm đồng thời mà không bị deadlock.
- **Tốc độ phản hồi AI:** AI Module phải trả về kết quả phát hiện ảnh trùng lặp / ảnh AI trong dưới 5 giây kể từ khi Webhook được trigger để không làm nghẽn luồng kiểm duyệt.

## 3. Tech Stack (Công nghệ đề xuất)
- **Web App:** ReactJS / Next.js
- **Mobile App:** Flutter
- **Backend:** Node.js (Express) / Spring Boot
- **Database:** PostgreSQL / MySQL / MongoDB
- **AI Integration:** Computer Vision (OpenCV), OpenAI API (Vision).
- **Triển khai:** Microsoft Azure / Firebase.
