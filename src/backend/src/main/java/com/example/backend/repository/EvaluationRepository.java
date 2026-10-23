package com.example.backend.repository;

import com.example.backend.entity.Evaluation;
import com.example.backend.enums.EvaluationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends MongoRepository<Evaluation, String> {
    List<Evaluation> findByJudgeId(String judgeId);
    List<Evaluation> findBySubmissionIdAndStatus(String submissionId, EvaluationStatus status);
    Optional<Evaluation> findBySubmissionIdAndRoundIdAndJudgeId(String submissionId, String roundId, String judgeId);
}
