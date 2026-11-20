package com.example.backend.dto;

import java.time.LocalDateTime;

import com.example.backend.enums.ContestStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ContestRequest {

    @NotBlank(message = "Tên cuộc thi không được để trống")
    @Size(max = 255, message = "Tên cuộc thi tối đa 255 ký tự")
    private String title;

    private String description;

    @Size(max = 500, message = "Đường dẫn ảnh bìa tối đa 500 ký tự")
    private String bannerUrl;

    @Size(max = 255, message = "Tên đơn vị tổ chức tối đa 255 ký tự")
    private String organizer;

    private Long categoryId;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    private LocalDateTime startDate;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    private LocalDateTime endDate;

    private LocalDateTime registrationDeadline;

    private ContestStatus status;

    public ContestRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBannerUrl() {
        return bannerUrl;
    }

    public void setBannerUrl(String bannerUrl) {
        this.bannerUrl = bannerUrl;
    }

    public String getOrganizer() {
        return organizer;
    }

    public void setOrganizer(String organizer) {
        this.organizer = organizer;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public LocalDateTime getRegistrationDeadline() {
        return registrationDeadline;
    }

    public void setRegistrationDeadline(LocalDateTime registrationDeadline) {
        this.registrationDeadline = registrationDeadline;
    }

    public ContestStatus getStatus() {
        return status;
    }

    public void setStatus(ContestStatus status) {
        this.status = status;
    }
}