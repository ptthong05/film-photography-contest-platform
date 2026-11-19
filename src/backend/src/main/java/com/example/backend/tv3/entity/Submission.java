package com.example.backend.tv3.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "submissions")
public class Submission extends Tv3Entity {
    @Column(nullable = false, length = 128)
    private String contestId;

    @Column(nullable = false, length = 128)
    private String participantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "frame_id")
    private Frame frame;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 4000)
    private String description;

    @Column(nullable = false, length = 120)
    private String category;

    @Column(nullable = false, length = 2048)
    private String imageUrl;

    @Column(nullable = false, length = 255)
    private String imagePublicId;

    @Column(length = 2048)
    private String negativeUrl;

    @Column(length = 255)
    private String negativePublicId;

    @Embedded private FilmMetadata metadata;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private SubmissionStatus status;

    @Column(length = 1000)
    private String rejectionReason;

    @Column(length = 128)
    private String reviewedBy;

    private java.time.Instant reviewedAt;

    public String getContestId() {
        return contestId;
    }

    public void setContestId(String value) {
        this.contestId = value;
    }

    public String getParticipantId() {
        return participantId;
    }

    public void setParticipantId(String value) {
        this.participantId = value;
    }

    public Frame getFrame() {
        return frame;
    }

    public void setFrame(Frame value) {
        this.frame = value;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String value) {
        this.title = value;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String value) {
        this.description = value;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String value) {
        this.category = value;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String value) {
        this.imageUrl = value;
    }

    public String getImagePublicId() {
        return imagePublicId;
    }

    public void setImagePublicId(String value) {
        this.imagePublicId = value;
    }

    public String getNegativeUrl() {
        return negativeUrl;
    }

    public void setNegativeUrl(String value) {
        this.negativeUrl = value;
    }

    public String getNegativePublicId() {
        return negativePublicId;
    }

    public void setNegativePublicId(String value) {
        this.negativePublicId = value;
    }

    public FilmMetadata getMetadata() {
        return metadata;
    }

    public void setMetadata(FilmMetadata value) {
        this.metadata = value;
    }

    public SubmissionStatus getStatus() {
        return status;
    }

    public void setStatus(SubmissionStatus value) {
        this.status = value;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String value) {
        this.rejectionReason = value;
    }

    public String getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(String value) {
        this.reviewedBy = value;
    }

    public java.time.Instant getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(java.time.Instant value) {
        this.reviewedAt = value;
    }
}
