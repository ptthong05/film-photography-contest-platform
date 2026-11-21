package com.example.backend.dto;

import jakarta.validation.constraints.NotNull;

public class RegistrationRequest {

    @NotNull(message = "Mã cuộc thi không được để trống")
    private Long contestId;

    @NotNull(message = "Mã người dùng không được để trống")
    private Long userId;

    private String note;

    public RegistrationRequest() {
    }

    public Long getContestId() {
        return contestId;
    }

    public void setContestId(Long contestId) {
        this.contestId = contestId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}