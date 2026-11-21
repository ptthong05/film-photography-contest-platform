package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.Round;

@Repository
public interface RoundRepository extends JpaRepository<Round, Long> {
    List<Round> findByContestIdOrderByRoundOrderAsc(Long contestId);
    boolean existsByContestIdAndRoundOrder(Long contestId, Integer roundOrder);
}