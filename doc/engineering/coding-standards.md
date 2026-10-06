# TIÊU CHUẨN LẬP TRÌNH (CODING STANDARDS)

Để duy trì mã nguồn sạch và dễ bảo trì cho nền tảng Cuộc thi Nhiếp ảnh Phim, toàn đội phát triển phải tuân thủ các quy chuẩn sau:

## 1. Naming Conventions (Quy tắc đặt tên)
- **Biến và Hàm (Variables/Functions):** Dùng `camelCase`. Ví dụ: `uploadFilmSubmission()`.
- **Lớp và Interface (Classes/Interfaces):** Dùng `PascalCase`. Ví dụ: `SubmissionController`.
- **Hằng số (Constants):** Dùng `UPPER_SNAKE_CASE`. Ví dụ: `MAX_IMAGE_SIZE_MB`.
- **Tên File (File Names):** 
  - Frontend (React): `PascalCase.tsx` cho Component (VD: `PhotoCard.tsx`).
  - Backend (Java/Python): `PascalCase.java` / `snake_case.py`.

## 2. Frontend (React/Next.js & Flutter)
- **Component:** Viết dưới dạng Functional Component, sử dụng React Hooks. Không dùng Class Component.
- **Styling:** Sử dụng TailwindCSS. Tránh viết CSS nội tuyến (inline CSS).
- **Quản lý state:** Dùng Zustand hoặc Redux Toolkit cho global state.

## 3. Backend (Spring Boot / Node.js)
- **Cấu trúc thư mục:** Tuân thủ chuẩn Layered Architecture (`Controller` -> `Service` -> `Repository`).
- **Xử lý lỗi:** Sử dụng `GlobalExceptionHandler` để trả về chuẩn JSON Error Response thống nhất. Không ném thẳng Exception ra ngoài API.
- **Bảo mật:** Mọi API (ngoại trừ Login/Register) đều phải có annotation kiểm tra JWT Token và Role.

## 4. AI Module (Python)
- Tuân thủ chuẩn **PEP 8**.
- Viết Type Hints đầy đủ cho các hàm FastAPI.
