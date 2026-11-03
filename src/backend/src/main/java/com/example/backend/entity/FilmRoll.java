package com.example.backend.entity;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

/** Cuộn phim thí sinh tự quản lý, dùng khi khai báo thông tin kỹ thuật lúc nộp bài. */
@Document(collection = "film_rolls")
public class FilmRoll extends BaseDocument {

    @Indexed
    private String participantId;
    private String name;
    private String brand;
    private int iso;
    private String format;
    private String cameraBody;
    private int totalFrames;
    private List<Integer> usedFrameNumbers = new ArrayList<>();

    public FilmRoll() {
    }

    public String getParticipantId() {
        return participantId;
    }

    public void setParticipantId(String participantId) {
        this.participantId = participantId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public int getIso() {
        return iso;
    }

    public void setIso(int iso) {
        this.iso = iso;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getCameraBody() {
        return cameraBody;
    }

    public void setCameraBody(String cameraBody) {
        this.cameraBody = cameraBody;
    }

    public int getTotalFrames() {
        return totalFrames;
    }

    public void setTotalFrames(int totalFrames) {
        this.totalFrames = totalFrames;
    }

    public List<Integer> getUsedFrameNumbers() {
        return usedFrameNumbers;
    }

    public void setUsedFrameNumbers(List<Integer> usedFrameNumbers) {
        this.usedFrameNumbers = usedFrameNumbers;
    }
}
