package com.example.backend.enums;

/** Vòng đời cuộc thi: nháp → sắp mở → nhận bài → chấm → kết thúc. */
public enum ContestStatus {
    DRAFT,
    UPCOMING,
    ONGOING,
    JUDGING,
    ENDED
}
