package com.example.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "film_rolls")
public class FilmRoll extends BaseEntity {
    @Column(nullable = false, length = 128)
    private String participantId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 120)
    private String brand;

    @Column(nullable = false)
    private int iso;

    @Column(nullable = false, length = 40)
    private String format;

    @Column(nullable = false, length = 200)
    private String cameraBody;

    @Column(nullable = false)
    private int totalFrames;

    public String getParticipantId() {
        return participantId;
    }

    public void setParticipantId(String value) {
        this.participantId = value;
    }

    public String getName() {
        return name;
    }

    public void setName(String value) {
        this.name = value;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String value) {
        this.brand = value;
    }

    public int getIso() {
        return iso;
    }

    public void setIso(int value) {
        this.iso = value;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String value) {
        this.format = value;
    }

    public String getCameraBody() {
        return cameraBody;
    }

    public void setCameraBody(String value) {
        this.cameraBody = value;
    }

    public int getTotalFrames() {
        return totalFrames;
    }

    public void setTotalFrames(int value) {
        this.totalFrames = value;
    }
}
