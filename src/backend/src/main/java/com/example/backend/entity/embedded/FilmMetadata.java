package com.example.backend.entity.embedded;

import java.time.LocalDate;

/**
 * Thông số kỹ thuật ảnh phim (SRS), nhúng trong bài dự thi.
 * Lưu dạng chuỗi (snapshot) thay vì tham chiếu master_data để bài cũ không đổi khi danh mục bị sửa.
 */
public record FilmMetadata(
        String filmBrand,
        String filmStock,
        Integer iso,
        String camera,
        String lens,
        String filmFormat,
        String frameNumber,
        LocalDate shootingDate,
        String shootingLocation,
        String developingLab,
        String scanSpec
) {
}
