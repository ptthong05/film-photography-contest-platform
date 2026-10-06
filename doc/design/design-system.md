# HỆ THỐNG THIẾT KẾ (DESIGN SYSTEM)

## 1. Triết lý thiết kế (Design Philosophy)
Hệ thống thiết kế của "AI-powered Film Photography Contest Management Platform" tập trung vào sự tối giản, làm nổi bật các tác phẩm nhiếp ảnh phim. 
- **Dark Mode (Chế độ tối):** Là chế độ mặc định để giúp hiển thị màu sắc và độ tương phản của ảnh phim một cách chân thực nhất.
- **Tập trung vào hình ảnh (Visual-First):** Các nút bấm và thanh điều hướng được làm chìm (subtle) để không tranh giành sự chú ý với tác phẩm dự thi.

## 2. Bảng màu (Color Palette)
- **Background (Nền):** `#121212` (Đen nhám, giúp giảm mỏi mắt khi giám khảo chấm thi lâu).
- **Surface (Bề mặt thẻ/khung):** `#1E1E1E`
- **Primary (Màu chủ đạo):** `#D4AF37` (Vàng kim loại - Gợi nhớ đến ánh sáng của phim và các giải thưởng danh giá).
- **Text (Chữ):**
  - Chữ chính: `#E0E0E0` (Trắng xám)
  - Chữ phụ: `#9E9E9E` (Xám)
- **Semantic (Cảnh báo/Trạng thái):**
  - **Lỗi/AI Cảnh báo (Error):** `#CF6679` (Đỏ pastel - Dùng khi AI phát hiện ảnh trùng lặp hoặc ảnh AI sinh ra).
  - **Thành công (Success):** `#03DAC6` (Xanh mòng két - Dùng khi bài thi được duyệt).

## 3. Typography (Kiểu chữ)
Sử dụng các font chữ không chân (Sans-serif) hiện đại:
- **Heading (Tiêu đề):** `Inter` hoặc `Playfair Display` (tạo cảm giác nghệ thuật, cổ điển cho các tiêu đề lớn).
- **Body (Nội dung):** `Roboto` hoặc `Inter` (dễ đọc, hiển thị tốt thông số kỹ thuật nhỏ).

## 4. Components chính
1. **Photo Card (Thẻ ảnh):** Hiển thị ảnh kèm một thanh overlay mờ (glassmorphism) chứa thông số cơ bản: *Film Stock, Camera, ISO*.
2. **AI Badge (Huy hiệu AI):** Các huy hiệu cảnh báo nhỏ hiển thị góc màn hình giám khảo (VD: ⚠️ *AI Flag: Duplicate 89%*).
3. **Rating Slider (Thanh chấm điểm):** Cho phép giám khảo trượt để chấm điểm các tiêu chí (0-10) thay vì nhập số, giúp thao tác nhanh hơn.
