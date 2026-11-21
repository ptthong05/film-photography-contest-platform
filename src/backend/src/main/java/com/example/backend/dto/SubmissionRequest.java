package com.example.backend.dto;

import com.example.backend.entity.FilmMetadata;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record SubmissionRequest(
        @NotBlank(message = "Không được bỏ trống")
                @Size(max = 128, message = "Độ dài tối đa {max} ký tự")
                String contestId,
        @NotBlank(message = "Không được bỏ trống")
                @Size(max = 200, message = "Độ dài tối đa {max} ký tự")
                String title,
        @Size(max = 4000, message = "Độ dài tối đa {max} ký tự") String description,
        @NotBlank(message = "Không được bỏ trống")
                @Size(max = 120, message = "Độ dài tối đa {max} ký tự")
                String category,
        @Size(max = 36, message = "Độ dài tối đa {max} ký tự") String frameId,
        @NotBlank(message = "Không được bỏ trống")
                @Size(max = 120, message = "Độ dài tối đa {max} ký tự")
                String filmBrand,
        @NotBlank(message = "Không được bỏ trống")
                @Size(max = 120, message = "Độ dài tối đa {max} ký tự")
                String filmStock,
        @NotNull(message = "Không được thiếu giá trị") @Min(value = 1, message = "Phải lớn hơn 0")
                Integer iso,
        @NotBlank(message = "Không được bỏ trống")
                @Size(max = 200, message = "Độ dài tối đa {max} ký tự")
                String camera,
        @NotBlank(message = "Không được bỏ trống")
                @Size(max = 200, message = "Độ dài tối đa {max} ký tự")
                String lens,
        @NotBlank(message = "Không được bỏ trống")
                @Size(max = 40, message = "Độ dài tối đa {max} ký tự")
                String format,
        @NotBlank(message = "Không được bỏ trống")
                @Pattern(
                        regexp = "[1-9][0-9]{0,8}",
                        message = "Số Frame phải là số nguyên dương tối đa 9 chữ số")
                String frameNumber,
        @PastOrPresent(message = "Ngày chụp không được ở tương lai") LocalDate shootingDate,
        @NotBlank(message = "Không được bỏ trống")
                @Size(max = 300, message = "Độ dài tối đa {max} ký tự")
                String shootingLocation,
        @NotBlank(message = "Không được bỏ trống")
                @Size(max = 200, message = "Độ dài tối đa {max} ký tự")
                String developingLab,
        @NotBlank(message = "Không được bỏ trống")
                @Size(max = 500, message = "Độ dài tối đa {max} ký tự")
                String scanningSpecs) {
    public FilmMetadata metadata() {
        FilmMetadata m = new FilmMetadata();
        m.setFilmBrand(filmBrand.trim());
        m.setFilmStock(filmStock.trim());
        m.setIso(iso);
        m.setCamera(camera.trim());
        m.setLens(lens.trim());
        m.setFilmFormat(format.trim());
        m.setFrameNumber(frameNumber);
        m.setShootingDate(shootingDate);
        m.setShootingLocation(shootingLocation.trim());
        m.setDevelopingLab(developingLab.trim());
        m.setScanSpec(scanningSpecs.trim());
        return m;
    }
}
