# TÍCH HỢP TRÍ TUỆ NHÂN TẠO (AI INTEGRATION)

## 1. Giới thiệu
Tài liệu này hướng dẫn Frontend/Backend Developer cách gọi và xử lý kết quả từ AI Module khi người dùng upload bài dự thi.

## 2. API Endpoint của AI Module (Nội bộ)
Backend cần gọi API này ngay sau khi lưu file ảnh thành công lên Cloud Storage.

- **Endpoint:** `POST http://ai-module:8000/analyze`
- **Headers:** `Authorization: Bearer <Internal_Service_Token>`

### Payload gửi đi (Request)
```json
{
  "submissionId": "65b4c1a2d3e4f50012abc",
  "imageUrl": "https://storage.provider.com/images/film_scan_01.jpg",
  "metadata": {
    "filmStock": "Kodak Portra 400",
    "camera": "Canon AE-1"
  }
}
```

### Kết quả trả về (Response)
```json
{
  "submissionId": "65b4c1a2d3e4f50012abc",
  "aiFlags": {
    "isDuplicate": false,
    "duplicateOf": null,
    "isAiGenerated": true,
    "aiConfidenceScore": 0.95
  },
  "autoTags": ["Portrait", "Color", "Outdoor"]
}
```

## 3. Cách xử lý tại Backend
1. Chuyển Request gửi tới AI thành tác vụ bất đồng bộ (Async Job / Message Queue) để không làm treo màn hình chờ của Thí sinh khi Upload.
2. Khi nhận được Response từ AI, Backend cập nhật field `aiVerification` trong bảng `Submissions`.
3. Nếu `isDuplicate == true` hoặc `isAiGenerated == true`: Chuyển trạng thái bài thi thành `PENDING_MANUAL_REVIEW` và gửi Notification (Thông báo đỏ) cho Contest Organizer.
