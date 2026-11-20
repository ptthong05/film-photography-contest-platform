package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.Article;
import com.example.backend.enums.ArticleStatus;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    List<Article> findByStatusOrderByPublishedAtDesc(ArticleStatus status);
    List<Article> findByAuthorIdOrderByCreatedAtDesc(Long authorId);
    List<Article> findByContestIdAndStatusOrderByPublishedAtDesc(Long contestId, ArticleStatus status);
}