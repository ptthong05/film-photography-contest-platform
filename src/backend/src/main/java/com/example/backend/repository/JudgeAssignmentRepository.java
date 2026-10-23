package com.example.backend.repository;

import com.example.backend.entity.JudgeAssignment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JudgeAssignmentRepository extends MongoRepository<JudgeAssignment, String> {
    List<JudgeAssignment> findByJudgeId(String judgeId);
    List<JudgeAssignment> findByContestId(String contestId);
    boolean existsByContestIdAndJudgeId(String contestId, String judgeId);
}
