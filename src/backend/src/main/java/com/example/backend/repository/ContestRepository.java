package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.Contest;
import com.example.backend.enums.ContestStatus;

@Repository
public interface ContestRepository extends JpaRepository<Contest, Long> {
    List<Contest> findByStatusOrderByStartDateAsc(ContestStatus status);
    List<Contest> findByCategoryId(Long categoryId);
    List<Contest> findByTitleContainingIgnoreCase(String keyword);
}