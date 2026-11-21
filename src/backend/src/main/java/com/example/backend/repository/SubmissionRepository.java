package com.example.backend.repository;

import com.example.backend.entity.Submission;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.*;

public interface SubmissionRepository extends JpaRepository<Submission, String> {
    List<Submission> findByParticipantId(String participantId);

    List<Submission> findByContestIdIn(java.util.Collection<String> contestIds);

    long countByContestIdAndParticipantId(String contestId, String participantId);

    boolean existsByFrameId(String frameId);

    boolean existsByFrameFilmRollId(String rollId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Submission s where s.id=:id")
    Optional<Submission> lockById(@Param("id") String id);
}
