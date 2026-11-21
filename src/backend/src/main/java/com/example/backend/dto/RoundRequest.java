package com.example.backend.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RoundRequest {

    @NotNull(message = "Mã cuộc thi không được để trống")
    private Long contestId;

    @NotBlank(message = "Tên vòng thi không được để trống")
    @Size(max = 150, message = "Tên vòng thi tối đa 150 ký tự")
    private String name;

    @NotNull(message = "Thứ tự vòng thi không được để trống")
    @Min(value = 1, message = "Thứ tự vòng thi phải lớn hơn hoặc bằng 1")
    private Integer roundOrder;

    @NotNull(message = "Thời gian bắt đầu vòng thi không được để trống")
    private LocalDateTime startDate;

    @NotNull(message = "Thời gian kết thúc vòng thi không được để trống")
    private LocalDateTime endDate;

    private String description;

    public RoundRequest() {
    }

    public Long getContestId() {
        return contestId;
    }

    public void setContestId(Long contestId) {
        this.contestId = contestId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getRoundOrder() {
        return roundOrder;
    }

    public void setRoundOrder(Integer roundOrder) {
        this.roundOrder = roundOrder;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}