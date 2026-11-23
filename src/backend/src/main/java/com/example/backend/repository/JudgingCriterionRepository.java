package com.example.backend.repository;

import com.example.backend.entity.JudgingCriterion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface JudgingCriterionRepository extends JpaRepository<JudgingCriterion, String> {

    List<JudgingCriterion> findByContestIdOrderByDisplayOrderAsc(Long contestId);

    List<JudgingCriterion> findByContestIdIn(Collection<Long> contestIds);

    void deleteByContestId(Long contestId);
}
