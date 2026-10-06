# THIẾT LẬP MÔI TRƯỜNG LÀM VIỆC (ENVIRONMENT SETUP)

Hướng dẫn cài đặt môi trường Local để chạy dự án Nền tảng Cuộc thi Nhiếp ảnh phim.

## 1. Yêu cầu phần mềm cốt lõi
- **Node.js**: v18.x hoặc mới nhất (Cho Frontend Web).
- **Java JDK**: v17+ (Cho Backend Spring Boot).
- **Python**: v3.10+ (Cho AI Module).
- **Flutter SDK**: v3.13+ (Cho Mobile App).
- **Docker & Docker Compose**: Dành cho việc chạy Database cục bộ.

## 2. Chạy cơ sở dữ liệu (Database)
Dự án sử dụng PostgreSQL/MongoDB. Để nhanh chóng, hãy dùng Docker:
```bash
docker-compose up -d db
```

## 3. Khởi động Backend (Spring Boot)
1. Mở thư mục `backend/`.
2. Cấu hình chuỗi kết nối DB trong `src/main/resources/application.properties`.
3. Chạy lệnh:
```bash
mvn spring-boot:run
```
*(Server chạy tại `http://localhost:8081`)*

## 4. Khởi động Frontend (React/Vite)
1. Mở thư mục `frontend/`.
2. Cài đặt thư viện: `npm install`
3. Chạy dev server:
```bash
npm run dev
```
*(Server chạy tại `http://localhost:5173`)*

## 5. Khởi động AI Module
1. Mở thư mục `ai-module/`.
2. Tạo môi trường ảo: `python -m venv venv`
3. Kích hoạt và cài thư viện: `pip install -r requirements.txt`
4. Khởi động FastAPI: `uvicorn main:app --reload --port 8000`
