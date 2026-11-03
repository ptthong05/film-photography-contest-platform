package com.example.backend.dto;

import java.util.List;

/** Số liệu thật cho trang báo cáo; mỗi điểm chuỗi thời gian là số bài nộp trong ngày hoặc tháng đó. */
public record ReportResponse(
        long ongoingContests,
        long totalContests,
        long participants,
        long submissions,
        long verifiedSubmissions,
        long pendingSubmissions,
        long rejectedSubmissions,
        long judges,
        List<CountItem> categoryDistribution,
        List<CountItem> filmStockDistribution,
        List<CountItem> submissionsLast30Days,
        List<CountItem> submissionsLast6Months,
        List<CountItem> submissionsThisYear
) {
    public record CountItem(String label, long count) {
    }
}
