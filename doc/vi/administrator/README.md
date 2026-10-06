# Hướng dẫn dành cho Quản trị viên (Administrator)

## 1. Tổng quan
Vai trò Quản trị viên (Administrator) chịu trách nhiệm vận hành và giám sát toàn bộ nền tảng "Quản lý cuộc thi nhiếp ảnh phim tích hợp AI".

## 2. Các chức năng chính (Dựa trên Sơ đồ luồng 3.4)

### 2.1. Đăng nhập và Kiểm tra quyền
- Truy cập vào hệ thống với tài khoản Admin.
- Hệ thống kiểm tra quyền truy cập (RBAC).

### 2.2. Quản lý hệ thống
- **Quản lý người dùng & Phân quyền:** Quản lý tài khoản của tất cả các Organizer, Judge và Participant. Có quyền khóa/mở khóa tài khoản.
- **Cấu hình hệ thống:** Thiết lập các thông số cơ bản cho hệ thống.
- **Quản lý Master Data:** Thêm mới/chỉnh sửa danh mục Master (Ví dụ: Thêm hãng phim mới, thêm loại máy ảnh cổ vào danh sách).
- **Giám sát hoạt động:** Theo dõi lưu lượng truy cập, logs hệ thống, trạng thái máy chủ Cloud Storage.
- **Quản lý cấu hình cuộc thi (Nếu được phân công):** Hỗ trợ Organizer cấu hình các cuộc thi phức tạp.

## 3. Đầu ra (Output)
- Mọi thay đổi đều được ghi log và lưu dữ liệu vào hệ thống lưu trữ cốt lõi.
