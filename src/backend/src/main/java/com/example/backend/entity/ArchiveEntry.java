package com.example.backend.entity;

import com.example.backend.entity.embedded.FilmMetadata;
import com.example.backend.entity.embedded.JudgeComment;
import com.example.backend.enums.PrizeRank;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

/**
 * Kho lưu trữ số: bản sao tối ưu để đọc của tác phẩm đạt giải. Chép dữ liệu (denormalize) để trang công khai không
 * phải join.
 */
@Document(collection = "archive_entries")
public class ArchiveEntry extends BaseDocument {

    /** -> contest_submissions._id */
    @Indexed(unique = true)
    private String submissionId;

    @Indexed
    private String contestId;

    private String contestTitle;

    @Indexed
    private int year;

    @Indexed
    private String participantId;

    private String authorName;

    private String title;

    private String description;

    private String imageUrl;

    private String thumbnailUrl;

    private PrizeRank prizeRank;

    private Double totalScore;

    private FilmMetadata metadata;

    private List<JudgeComment> judgeComments = new ArrayList<>();

    public ArchiveEntry() {
    }

    public String getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(String submissionId) {
        this.submissionId = submissionId;
    }

    public String getContestId() {
        return contestId;
    }

    public void setContestId(String contestId) {
        this.contestId = contestId;
    }

    public String getContestTitle() {
        return contestTitle;
    }

    public void setContestTitle(String contestTitle) {
        this.contestTitle = contestTitle;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public String getParticipantId() {
        return participantId;
    }

    public void setParticipantId(String participantId) {
        this.participantId = participantId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public PrizeRank getPrizeRank() {
        return prizeRank;
    }

    public void setPrizeRank(PrizeRank prizeRank) {
        this.prizeRank = prizeRank;
    }

    public Double getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(Double totalScore) {
        this.totalScore = totalScore;
    }

    public FilmMetadata getMetadata() {
        return metadata;
    }

    public void setMetadata(FilmMetadata metadata) {
        this.metadata = metadata;
    }

    public List<JudgeComment> getJudgeComments() {
        return judgeComments;
    }

    public void setJudgeComments(List<JudgeComment> judgeComments) {
        this.judgeComments = judgeComments;
    }
}
