package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.DigitalArchive;

@Repository
public interface DigitalArchiveRepository extends JpaRepository<DigitalArchive, Long> {
    List<DigitalArchive> findAllByOrderByArchiveYearDescCreatedAtDesc();
    List<DigitalArchive> findByArchiveYear(Integer archiveYear);
    List<DigitalArchive> findByAwardNameContainingIgnoreCase(String awardName);
    List<DigitalArchive> findByTitleContainingIgnoreCase(String keyword);
}