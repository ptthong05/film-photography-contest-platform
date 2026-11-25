package com.example.backend.repository;

import com.example.backend.entity.ContestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContestResultRepository extends JpaRepository<ContestResult, String> {

    List<ContestResult> findByContestIdOrderByRankingAsc(Long contestId);

    boolean existsByContestId(Long contestId);

    void deleteByContestId(Long contestId);
}
