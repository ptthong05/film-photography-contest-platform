package com.example.backend.repository;

import com.example.backend.entity.Evaluation;
import com.example.backend.enums.EvaluationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, String> {

    List<Evaluation> findByJudgeId(String judgeId);

    List<Evaluation> findBySubmissionIdAndStatus(String submissionId, EvaluationStatus status);

    List<Evaluation> findBySubmissionIdAndJudgeIdAndStatus(
            String submissionId, String judgeId, EvaluationStatus status);

    Optional<Evaluation> findBySubmissionIdAndRoundIdAndJudgeId(String submissionId, Long roundId, String judgeId);

    List<Evaluation> findByContestId(Long contestId);

    boolean existsByContestIdAndRoundIdAndJudgeId(Long contestId, Long roundId, String judgeId);
}
