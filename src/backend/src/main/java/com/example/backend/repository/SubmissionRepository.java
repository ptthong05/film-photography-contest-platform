package com.example.backend.repository;

import com.example.backend.entity.Submission;
import com.example.backend.enums.SubmissionStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends MongoRepository<Submission, String> {
    List<Submission> findByContestId(String contestId);
    List<Submission> findByContestIdAndStatus(String contestId, SubmissionStatus status);
    List<Submission> findByParticipantId(String participantId);
    long countByContestIdAndParticipantId(String contestId, String participantId);
}
