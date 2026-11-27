package com.example.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Tiêu chí chấm điểm của một cuộc thi (sáng tạo, bố cục, grain phim...).
 * weight tính theo %, tổng weight các tiêu chí của một cuộc thi = 100 (kiểm tra ở service).
 */
@Entity
@Table(
        name = "judging_criteria",
        uniqueConstraints = @UniqueConstraint(name = "uk_criteria_contest_name", columnNames = {"contest_id", "name"}),
        indexes = @Index(name = "idx_criteria_contest", columnList = "contest_id"))
public class JudgingCriterion extends BaseEntity {

    /** -> contests.id */
    @Column(nullable = false)
    private Long contestId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private double maxScore = 10;

    @Column(nullable = false)
    private double weight;

    @Column(nullable = false)
    private int displayOrder;

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(double maxScore) {
        this.maxScore = maxScore;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }
}
