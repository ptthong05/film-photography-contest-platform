package com.example.backend.repository;

import com.example.backend.entity.JudgeAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JudgeAssignmentRepository extends JpaRepository<JudgeAssignment, String> {

    List<JudgeAssignment> findByJudgeId(String judgeId);

    List<JudgeAssignment> findByContestId(Long contestId);

    boolean existsByContestIdAndJudgeId(Long contestId, String judgeId);

    Optional<JudgeAssignment> findByContestIdAndRoundIdAndJudgeId(Long contestId, Long roundId, String judgeId);

    void deleteByContestId(Long contestId);
}
