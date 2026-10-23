package com.example.backend.entity;

import com.example.backend.entity.embedded.Award;
import com.example.backend.entity.embedded.JudgingCriterion;
import com.example.backend.entity.embedded.JudgingRound;
import com.example.backend.enums.ContestStatus;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** Cuộc thi. Vòng chấm, tiêu chí và giải thưởng nhúng luôn trong document vì luôn đọc cùng cuộc thi. */
@Document(collection = "contests")
public class Contest extends BaseDocument {

    private String title;

    /** Dùng làm đường dẫn #/contest/{slug} */
    @Indexed(unique = true)
    private String slug;

    private String theme;

    private String description;

    private String coverUrl;

    private List<String> categories = new ArrayList<>();

    /** -> users._id (role ORGANIZER) */
    @Indexed
    private String organizerId;

    @Indexed
    private ContestStatus status = ContestStatus.DRAFT;

    private Instant submissionStart;

    private Instant submissionEnd;

    private Instant judgingStart;

    private Instant judgingEnd;

    private int maxPhotosPerParticipant = 1;

    /** Bật thì API cho giám khảo không trả tên tác giả */
    private boolean anonymousJudging;

    private List<JudgingRound> rounds = new ArrayList<>();

    private List<JudgingCriterion> criteria = new ArrayList<>();

    private List<Award> awards = new ArrayList<>();

    private String regulations;

    /** null = chưa công bố kết quả */
    private Instant resultPublishedAt;

    public Contest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }

    public List<String> getCategories() {
        return categories;
    }

    public void setCategories(List<String> categories) {
        this.categories = categories;
    }

    public String getOrganizerId() {
        return organizerId;
    }

    public void setOrganizerId(String organizerId) {
        this.organizerId = organizerId;
    }

    public ContestStatus getStatus() {
        return status;
    }

    public void setStatus(ContestStatus status) {
        this.status = status;
    }

    public Instant getSubmissionStart() {
        return submissionStart;
    }

    public void setSubmissionStart(Instant submissionStart) {
        this.submissionStart = submissionStart;
    }

    public Instant getSubmissionEnd() {
        return submissionEnd;
    }

    public void setSubmissionEnd(Instant submissionEnd) {
        this.submissionEnd = submissionEnd;
    }

    public Instant getJudgingStart() {
        return judgingStart;
    }

    public void setJudgingStart(Instant judgingStart) {
        this.judgingStart = judgingStart;
    }

    public Instant getJudgingEnd() {
        return judgingEnd;
    }

    public void setJudgingEnd(Instant judgingEnd) {
        this.judgingEnd = judgingEnd;
    }

    public int getMaxPhotosPerParticipant() {
        return maxPhotosPerParticipant;
    }

    public void setMaxPhotosPerParticipant(int maxPhotosPerParticipant) {
        this.maxPhotosPerParticipant = maxPhotosPerParticipant;
    }

    public boolean isAnonymousJudging() {
        return anonymousJudging;
    }

    public void setAnonymousJudging(boolean anonymousJudging) {
        this.anonymousJudging = anonymousJudging;
    }

    public List<JudgingRound> getRounds() {
        return rounds;
    }

    public void setRounds(List<JudgingRound> rounds) {
        this.rounds = rounds;
    }

    public List<JudgingCriterion> getCriteria() {
        return criteria;
    }

    public void setCriteria(List<JudgingCriterion> criteria) {
        this.criteria = criteria;
    }

    public List<Award> getAwards() {
        return awards;
    }

    public void setAwards(List<Award> awards) {
        this.awards = awards;
    }

    public String getRegulations() {
        return regulations;
    }

    public void setRegulations(String regulations) {
        this.regulations = regulations;
    }

    public Instant getResultPublishedAt() {
        return resultPublishedAt;
    }

    public void setResultPublishedAt(Instant resultPublishedAt) {
        this.resultPublishedAt = resultPublishedAt;
    }
}
