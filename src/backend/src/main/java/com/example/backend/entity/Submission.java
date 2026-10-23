package com.example.backend.entity;

import com.example.backend.entity.embedded.AiVerification;
import com.example.backend.entity.embedded.FilmMetadata;
import com.example.backend.enums.PrizeRank;
import com.example.backend.enums.SubmissionStatus;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

/** Bài dự thi. Ảnh lưu trên Cloud Storage, ở đây chỉ giữ URL. Tổng điểm được tính lại khi phiếu chấm FINALIZED. */
@CompoundIndex(name = "contest_status", def = "{'contestId': 1, 'status': 1}")
@Document(collection = "contest_submissions")
public class Submission extends BaseDocument {

    /** -> contests._id */
    private String contestId;

    /** -> users._id (role PARTICIPANT) */
    @Indexed
    private String participantId;

    private String title;

    private String description;

    /** Một trong contests.categories */
    private String category;

    private List<String> imageUrls = new ArrayList<>();

    /** Cùng thứ tự với imageUrls */
    private List<String> thumbnailUrls = new ArrayList<>();

    /** Ảnh chụp âm bản để chứng minh là ảnh phim */
    private List<String> negativeUrls = new ArrayList<>();

    private String contactSheetUrl;

    private FilmMetadata metadata;

    private SubmissionStatus status = SubmissionStatus.PENDING;

    private String rejectionReason;

    /** null = AI chưa kiểm tra */
    private AiVerification aiVerification;

    /** Điểm trung bình các phiếu FINALIZED */
    private Double totalScore;

    /** null = không đạt giải */
    private PrizeRank prizeRank;

    public Submission() {
    }

    public String getContestId() {
        return contestId;
    }

    public void setContestId(String contestId) {
        this.contestId = contestId;
    }

    public String getParticipantId() {
        return participantId;
    }

    public void setParticipantId(String participantId) {
        this.participantId = participantId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    public List<String> getThumbnailUrls() {
        return thumbnailUrls;
    }

    public void setThumbnailUrls(List<String> thumbnailUrls) {
        this.thumbnailUrls = thumbnailUrls;
    }

    public List<String> getNegativeUrls() {
        return negativeUrls;
    }

    public void setNegativeUrls(List<String> negativeUrls) {
        this.negativeUrls = negativeUrls;
    }

    public String getContactSheetUrl() {
        return contactSheetUrl;
    }

    public void setContactSheetUrl(String contactSheetUrl) {
        this.contactSheetUrl = contactSheetUrl;
    }

    public FilmMetadata getMetadata() {
        return metadata;
    }

    public void setMetadata(FilmMetadata metadata) {
        this.metadata = metadata;
    }

    public SubmissionStatus getStatus() {
        return status;
    }

    public void setStatus(SubmissionStatus status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public AiVerification getAiVerification() {
        return aiVerification;
    }

    public void setAiVerification(AiVerification aiVerification) {
        this.aiVerification = aiVerification;
    }

    public Double getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(Double totalScore) {
        this.totalScore = totalScore;
    }

    public PrizeRank getPrizeRank() {
        return prizeRank;
    }

    public void setPrizeRank(PrizeRank prizeRank) {
        this.prizeRank = prizeRank;
    }
}
