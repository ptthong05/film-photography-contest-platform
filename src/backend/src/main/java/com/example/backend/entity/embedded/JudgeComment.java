package com.example.backend.entity.embedded;

/** Nhận xét công khai của giám khảo, chép sang kho lưu trữ khi tác phẩm đạt giải. */
public record JudgeComment(
        String judgeId,
        String judgeName,
        String comment
) {
}
