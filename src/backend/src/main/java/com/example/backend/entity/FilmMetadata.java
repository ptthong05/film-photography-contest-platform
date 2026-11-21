package com.example.backend.entity;

import jakarta.persistence.*;

@Embeddable
public class FilmMetadata {
    @Column(length = 120)
    private String filmBrand;

    @Column(length = 120)
    private String filmStock;

    @Column() private Integer iso;

    @Column(length = 200)
    private String camera;

    @Column(length = 200)
    private String lens;

    @Column(length = 40)
    private String filmFormat;

    @Column(length = 10)
    private String frameNumber;

    @Column() private java.time.LocalDate shootingDate;

    @Column(length = 300)
    private String shootingLocation;

    @Column(length = 200)
    private String developingLab;

    @Column(length = 500)
    private String scanSpec;

    public String getFilmBrand() {
        return filmBrand;
    }

    public void setFilmBrand(String v) {
        filmBrand = v;
    }

    public String getFilmStock() {
        return filmStock;
    }

    public void setFilmStock(String v) {
        filmStock = v;
    }

    public Integer getIso() {
        return iso;
    }

    public void setIso(Integer v) {
        iso = v;
    }

    public String getCamera() {
        return camera;
    }

    public void setCamera(String v) {
        camera = v;
    }

    public String getLens() {
        return lens;
    }

    public void setLens(String v) {
        lens = v;
    }

    public String getFilmFormat() {
        return filmFormat;
    }

    public void setFilmFormat(String v) {
        filmFormat = v;
    }

    public String getFrameNumber() {
        return frameNumber;
    }

    public void setFrameNumber(String v) {
        frameNumber = v;
    }

    public java.time.LocalDate getShootingDate() {
        return shootingDate;
    }

    public void setShootingDate(java.time.LocalDate v) {
        shootingDate = v;
    }

    public String getShootingLocation() {
        return shootingLocation;
    }

    public void setShootingLocation(String v) {
        shootingLocation = v;
    }

    public String getDevelopingLab() {
        return developingLab;
    }

    public void setDevelopingLab(String v) {
        developingLab = v;
    }

    public String getScanSpec() {
        return scanSpec;
    }

    public void setScanSpec(String v) {
        scanSpec = v;
    }
}
