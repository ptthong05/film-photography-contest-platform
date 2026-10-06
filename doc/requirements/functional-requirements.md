# YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

Dựa trên đề xuất của "Nền tảng tổ chức và quản lý cuộc thi nhiếp ảnh phim", hệ thống có 5 luồng chức năng cốt lõi (Business Core Flows).

## Core Flow 1: Lên kế hoạch & Cấu hình cuộc thi
- **Mô tả:** Ban tổ chức (Organizer) tạo cuộc thi mới.
- **Chức năng chi tiết:** Định nghĩa chủ đề, hạng mục, lịch trình nộp/chấm bài, tiêu chí đánh giá, cơ cấu giải thưởng và quy chế tham gia. Hỗ trợ tính năng Template để nhân bản cuộc thi cho các mùa sau.

## Core Flow 2: Nộp bài & Quản lý siêu dữ liệu (Metadata)
- **Mô tả:** Thí sinh (Participant) upload ảnh phim scan.
- **Chức năng chi tiết:** Hệ thống bắt buộc thí sinh khai báo nguồn gốc vật lý của bức ảnh: Hãng phim (Film brand), loại phim (Film stock), ISO, máy ảnh, ống kính, số khung hình (frame number), lab tráng rửa và thông số scan.

## Core Flow 3: Xác minh bài thi (Verification)
- **Mô tả:** Trước khi giao bài cho Giám khảo, hệ thống kiểm duyệt ảnh.
- **Chức năng chi tiết:** 
  - Kiểm tra tính hợp lệ của format ảnh và hạn chót.
  - **Tích hợp AI:** Phát hiện ảnh trùng lặp (Duplicate) và ảnh AI tạo ra (AI-generated).
  - Organizer duyệt tay (Manual review) các trường hợp bị AI cắm cờ.

## Core Flow 4: Đánh giá & Chấm điểm (Judging)
- **Mô tả:** Giám khảo chấm điểm bài thi.
- **Chức năng chi tiết:** Phân công bài thi cho giám khảo. Cung cấp giao diện chấm điểm theo thanh trượt dựa trên bộ tiêu chí động (Ví dụ: Sáng tạo, Bố cục, Chất lượng Scan...). Tự động tính tổng điểm và xếp hạng.

## Core Flow 5: Công bố kết quả & Lưu trữ số
- **Mô tả:** Đóng cuộc thi và vinh danh tác phẩm.
- **Chức năng chi tiết:** Tính toán xếp hạng cuối cùng, công bố kết quả (online exhibition). Đẩy các tác phẩm đạt giải cùng metadata và nhận xét của giám khảo vào Digital Archive.
