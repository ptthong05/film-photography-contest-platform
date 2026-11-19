package com.example.backend.tv3.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "frames")
public class Frame extends Tv3Entity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "film_roll_id", nullable = false)
    private FilmRoll filmRoll;

    @Column(nullable = false)
    private int frameNumber;

    @Column(length = 1000)
    private String notes;

    public FilmRoll getFilmRoll() {
        return filmRoll;
    }

    public void setFilmRoll(FilmRoll value) {
        this.filmRoll = value;
    }

    public int getFrameNumber() {
        return frameNumber;
    }

    public void setFrameNumber(int value) {
        this.frameNumber = value;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String value) {
        this.notes = value;
    }
}
