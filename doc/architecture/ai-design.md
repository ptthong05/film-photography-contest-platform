# THIẾT KẾ MODULE TRÍ TUỆ NHÂN TẠO (AI DESIGN)

## 1. Tổng quan (Overview)
Module Trí tuệ nhân tạo (AI Module) là một Microservice độc lập, chịu trách nhiệm tự động hóa khâu xác minh và phân tích ảnh cho nền tảng quản lý cuộc thi nhiếp ảnh phim. Module này được viết bằng Python (sử dụng FastAPI) để tận dụng các thư viện AI mạnh mẽ như OpenCV, PyTorch, và tích hợp OpenAI API.

## 2. Các thành phần phân tích (AI Components)

### 2.1. Image Similarity Detection (Phát hiện ảnh trùng lặp)
- **Mục tiêu:** Ngăn chặn thí sinh nộp cùng một bức ảnh cho nhiều cuộc thi, hoặc đánh cắp ảnh của người khác đã có trong hệ thống.
- **Phương pháp:** 
  - Sử dụng Perceptual Hashing (pHash) hoặc mô hình ResNet50 để trích xuất đặc trưng (feature embeddings) của ảnh ngay khi upload.
  - So sánh khoảng cách vector (Cosine Similarity) với cơ sở dữ liệu ảnh cũ.
  - Ngưỡng cảnh báo: Trùng khớp > 90% sẽ kích hoạt cờ `IS_DUPLICATE`.

### 2.2. AI-generated Image Detection (Phát hiện ảnh do AI tạo ra)
- **Mục tiêu:** Bảo vệ tính nguyên bản của "Nhiếp ảnh phim". Chặn các ảnh được sinh ra hoặc chỉnh sửa quá mức bằng Midjourney, DALL-E, Stable Diffusion.
- **Phương pháp:**
  - Chạy mô hình phân tích nhiễu pixel (Noise Pattern Analysis) và cấu trúc phổ (Frequency Domain) để tìm kiếm các bất thường phi tự nhiên (artifacts) đặc trưng của AI.
  - Nếu độ tin cậy của AI sinh ra > 80%, kích hoạt cờ `IS_AI_GENERATED`.

### 2.3. Tự động gán nhãn & Phân loại (Auto-categorization & Tagging)
- **Mục tiêu:** Hỗ trợ giám khảo chấm bài và phục vụ thống kê (Ví dụ: Thống kê có bao nhiêu ảnh chân dung vs phong cảnh).
- **Phương pháp:** Gửi URL ảnh sang OpenAI API (Vision) hoặc dùng mô hình phân loại (Classification Model) cục bộ để sinh ra mảng từ khóa: `[Portrait, B&W, Street, Night]`.

## 3. Kiến trúc tích hợp (Integration Architecture)
- Module AI không giao tiếp trực tiếp với Database chính hay Frontend. Nó hoạt động như một dịch vụ nội bộ (Internal Service).
- **Luồng:** `Frontend` -> Upload ảnh -> `Backend API` -> Gửi Job sang `AI Module` qua Message Queue hoặc Webhook -> `AI Module` trả về JSON kết quả -> `Backend API` lưu vào `aiFlags` trong Database.
