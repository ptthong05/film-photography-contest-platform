package com.example.backend.dto;

import com.example.backend.enums.ArticleStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ArticleRequest {

    @NotBlank(message = "Tiêu đề bài viết không được để trống")
    @Size(max = 255, message = "Tiêu đề bài viết tối đa 255 ký tự")
    private String title;

    private String summary;

    @NotBlank(message = "Nội dung bài viết không được để trống")
    private String content;

    @Size(max = 500, message = "Đường dẫn ảnh bìa tối đa 500 ký tự")
    private String coverImage;

    @NotNull(message = "Mã tác giả không được để trống")
    private Long authorId;

    private Long contestId;

    private ArticleStatus status;

    public ArticleRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }

    public Long getContestId() {
        return contestId;
    }

    public void setContestId(Long contestId) {
        this.contestId = contestId;
    }

    public ArticleStatus getStatus() {
        return status;
    }

    public void setStatus(ArticleStatus status) {
        this.status = status;
    }
}