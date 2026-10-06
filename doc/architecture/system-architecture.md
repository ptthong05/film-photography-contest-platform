# KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

## 1. Bối cảnh & Mục tiêu
Hệ thống là nền tảng quản lý chuyên dụng cho các cuộc thi nhiếp ảnh phim. Nền tảng số hóa các hoạt động, chuẩn hóa quy trình chấm điểm và thiết lập kho lưu trữ tài sản số (Digital Asset Management - DAM), tạo sự khác biệt so với thi ảnh kỹ thuật số thông thường thông qua việc quản lý chặt chẽ metadata nhiếp ảnh phim và nguồn gốc vật lý của bức ảnh.

## 2. Kiến trúc cấp cao
Nền tảng sử dụng kiến trúc phân hệ (modular), dễ dàng mở rộng để hỗ trợ chạy đồng thời nhiều cuộc thi và nhiều giám khảo cùng chấm điểm.

### 2.1. Ứng dụng Client
- **Ứng dụng Web**: Xây dựng bằng ReactJS (Vite) / Next.js. Đóng vai trò là cổng quản trị dành cho Người tổ chức (Organizer), Giám khảo (Judge) và Quản trị viên (Admin).
- **Ứng dụng Mobile**: Xây dựng bằng Flutter. Tối ưu hóa cho Thí sinh để quản lý hồ sơ, đăng ký thi và nộp ảnh mọi lúc mọi nơi.

### 2.2. Dịch vụ Backend
- **Core API**: Sử dụng ASP.NET Core Web API, Node.js (Express) hoặc Spring Boot. Xử lý các thao tác CRUD, phân quyền JWT, và điều phối toàn bộ luồng nghiệp vụ cuộc thi.
- **Cơ sở dữ liệu**: PostgreSQL / MySQL (Quan hệ) hoặc MongoDB (Phi quan hệ) để lưu trữ metadata phức tạp, cấu hình giải và kho lưu trữ.

### 2.3. Module Trí tuệ nhân tạo (AI & Computer Vision)
- Là một dịch vụ Python/FastAPI độc lập tích hợp các thuật toán Thị giác máy tính (Computer Vision) và OpenAI API.
- **Nhiệm vụ**:
  - Image Similarity Detection (Phát hiện ảnh trùng lặp).
  - AI-generated Image Detection (Nhận diện ảnh do AI tạo ra).
  - Tự động phân loại, gán nhãn (Tagging).
  - Sinh báo cáo thống kê.

### 2.4. Hạ tầng đám mây (Cloud Infrastructure)
- **Lưu trữ Cloud (Storage)**: Sử dụng Firebase Storage hoặc Azure Blob Storage để lưu trữ an toàn các file ảnh scan dung lượng cao.
- **Triển khai (Deployment)**: Microsoft Azure hoặc Firebase.

## 3. Bảo mật & Truy cập
- Xác thực và ủy quyền được triển khai chặt chẽ qua cơ chế JWT (JSON Web Tokens).
- Phân tách quyền rõ rệt: Administrator, Contest Organizer, Judge, Participant.
