package com.example.backend.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

/** API trao đổi ngày dạng yyyy-MM-dd theo giờ Việt Nam; DB lưu Instant. Mốc kết thúc tính hết ngày đó. */
public final class AppDates {

    public static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private AppDates() {
    }

    public static Instant startOfDay(LocalDate date) {
        return date == null ? null : date.atStartOfDay(ZONE).toInstant();
    }

    public static Instant endOfDay(LocalDate date) {
        return date == null ? null : date.plusDays(1).atStartOfDay(ZONE).toInstant().minusMillis(1);
    }

    public static LocalDate toDate(Instant instant) {
        return instant == null ? null : instant.atZone(ZONE).toLocalDate();
    }
}
