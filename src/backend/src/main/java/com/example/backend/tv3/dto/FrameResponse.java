package com.example.backend.tv3.dto;

import com.example.backend.tv3.entity.Frame;

public record FrameResponse(
        String id, String filmRollId, int frameNumber, String notes, long version) {
    public static FrameResponse from(Frame f) {
        return new FrameResponse(
                f.getId(),
                f.getFilmRoll().getId(),
                f.getFrameNumber(),
                f.getNotes(),
                f.getVersion());
    }
}
