package com.example.backend.tv3.dto;

import com.example.backend.tv3.entity.FilmRoll;

import java.util.List;

public record FilmRollResponse(
        String id,
        String code,
        String name,
        String brand,
        int iso,
        String format,
        String cameraBody,
        int totalFrames,
        List<Integer> usedFrameNumbers,
        long version) {
    public static FilmRollResponse from(FilmRoll r, List<Integer> numbers) {
        return new FilmRollResponse(
                r.getId(),
                "ROLL #" + r.getId().substring(0, 8),
                r.getName(),
                r.getBrand(),
                r.getIso(),
                r.getFormat(),
                r.getCameraBody(),
                r.getTotalFrames(),
                numbers,
                r.getVersion());
    }
}
