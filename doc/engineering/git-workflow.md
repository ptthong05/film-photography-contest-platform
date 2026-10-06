# QUY TRÌNH QUẢN LÝ MÃ NGUỒN (GIT WORKFLOW)

Dự án áp dụng mô hình **Gitflow** rút gọn để quản lý mã nguồn, đảm bảo tính ổn định cho hệ thống thi ảnh trực tuyến.

## 1. Các nhánh chính (Main Branches)
- `main`: Chứa code đã được kiểm thử và đang chạy trên Production (Môi trường thật).
- `develop`: Nhánh gom code (Integration branch). Mọi tính năng mới sau khi hoàn thành sẽ merge vào đây.

## 2. Các nhánh phụ (Supporting Branches)
Khi Dev nhận task (Ví dụ: Làm tính năng phát hiện ảnh AI), phải tạo nhánh mới từ `develop`.
- **Cú pháp đặt tên:** `<loại>/<mã-task>-<tên-ngắn-gọn>`
  - `feature/AI-123-image-similarity` (Tính năng mới)
  - `bugfix/UI-456-fix-upload-btn` (Sửa lỗi trong lúc dev)
  - `hotfix/CORE-789-crash-on-login` (Sửa lỗi khẩn cấp trên Production, rẽ nhánh từ `main`).

## 3. Quy trình Commit Code
Commit message phải tuân thủ chuẩn **Conventional Commits**:
- `feat: add duplicate image detection webhook`
- `fix: resolve JWT expiration issue`
- `docs: update system architecture diagram`
- `style: format Python AI module to PEP8`

## 4. Quy trình Merge (Pull Request - PR)
1. Push nhánh feature của bạn lên GitHub.
2. Tạo Pull Request (PR) trỏ vào nhánh `develop`.
3. Yêu cầu ít nhất 1 thành viên khác (Reviewer) xem code (Code Review).
4. Sau khi Reviewer "Approve", tiến hành `Squash and Merge` để giữ cho lịch sử commit trên `develop` được gọn gàng.
