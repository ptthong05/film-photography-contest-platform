package com.example.backend.dto;

import com.example.backend.entity.FilmRoll;

import java.util.List;
import java.util.Locale;

public record FilmRollResponse(
        String id,
        String code,
        String name,
        String brand,
        int iso,
        String format,
        String cameraBody,
        int totalFrames,
        List<Integer> usedFrameNumbers
) {
    public static FilmRollResponse fromEntity(FilmRoll roll) {
        String id = roll.getId();
        return new FilmRollResponse(
                id,
                "ROLL #" + id.substring(Math.max(0, id.length() - 4)).toUpperCase(Locale.ROOT),
                roll.getName(),
                roll.getBrand(),
                roll.getIso(),
                roll.getFormat(),
                roll.getCameraBody(),
                roll.getTotalFrames(),
                roll.getUsedFrameNumbers());
    }
}
