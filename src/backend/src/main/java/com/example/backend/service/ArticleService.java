package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.backend.dto.ArticleRequest;
import com.example.backend.dto.ArticleResponse;
import com.example.backend.entity.Article;
import com.example.backend.entity.Contest;
import com.example.backend.enums.ArticleStatus;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ArticleRepository;
import com.example.backend.repository.ContestRepository;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final ContestRepository contestRepository;

    public ArticleService(ArticleRepository articleRepository, ContestRepository contestRepository) {
        this.articleRepository = articleRepository;
        this.contestRepository = contestRepository;
    }

    public List<ArticleResponse> getPublishedArticles(Long contestId) {
        List<Article> articles = (contestId != null)
                ? articleRepository.findByContestIdAndStatusOrderByPublishedAtDesc(contestId, ArticleStatus.PUBLISHED)
                : articleRepository.findByStatusOrderByPublishedAtDesc(ArticleStatus.PUBLISHED);

        return articles.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ArticleResponse> getArticlesByAuthor(Long authorId) {
        return articleRepository.findByAuthorIdOrderByCreatedAtDesc(authorId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ArticleResponse getArticleById(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với id: " + id));
        return toResponse(article);
    }

    public ArticleResponse createArticle(ArticleRequest request) {
        Article article = new Article();
        mapRequestToEntity(request, article);

        ArticleStatus targetStatus = (request.getStatus() != null) ? request.getStatus() : ArticleStatus.DRAFT;
        article.setStatus(targetStatus);
        if (targetStatus == ArticleStatus.PUBLISHED) {
            article.setPublishedAt(LocalDateTime.now());
        }

        Article saved = articleRepository.save(article);
        return toResponse(saved);
    }

    public ArticleResponse updateArticle(Long id, ArticleRequest request) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với id: " + id));

        ArticleStatus previousStatus = article.getStatus();
        mapRequestToEntity(request, article);

        if (request.getStatus() != null) {
            article.setStatus(request.getStatus());
            if (previousStatus != ArticleStatus.PUBLISHED && request.getStatus() == ArticleStatus.PUBLISHED) {
                article.setPublishedAt(LocalDateTime.now());
            }
        }

        Article updated = articleRepository.save(article);
        return toResponse(updated);
    }

    public ArticleResponse publishArticle(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với id: " + id));

        article.setStatus(ArticleStatus.PUBLISHED);
        if (article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDateTime.now());
        }

        Article published = articleRepository.save(article);
        return toResponse(published);
    }

    public void deleteArticle(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với id: " + id));
        articleRepository.delete(article);
    }

    private void mapRequestToEntity(ArticleRequest request, Article article) {
        article.setTitle(request.getTitle().trim());
        article.setSummary(request.getSummary());
        article.setContent(request.getContent());
        article.setCoverImage(request.getCoverImage());
        article.setAuthorId(request.getAuthorId());

        if (request.getContestId() != null) {
            Contest contest = contestRepository.findById(request.getContestId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc thi với id: " + request.getContestId()));
            article.setContest(contest);
        } else {
            article.setContest(null);
        }
    }

    private ArticleResponse toResponse(Article article) {
        ArticleResponse response = new ArticleResponse();
        response.setId(article.getId());
        response.setTitle(article.getTitle());
        response.setSummary(article.getSummary());
        response.setContent(article.getContent());
        response.setCoverImage(article.getCoverImage());
        response.setAuthorId(article.getAuthorId());
        if (article.getContest() != null) {
            response.setContestId(article.getContest().getId());
            response.setContestTitle(article.getContest().getTitle());
        }
        response.setStatus(article.getStatus());
        response.setPublishedAt(article.getPublishedAt());
        response.setCreatedAt(article.getCreatedAt());
        response.setUpdatedAt(article.getUpdatedAt());
        return response;
    }
}