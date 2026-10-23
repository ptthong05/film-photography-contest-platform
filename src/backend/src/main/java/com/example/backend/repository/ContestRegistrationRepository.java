package com.example.backend.repository;

import com.example.backend.entity.ContestRegistration;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContestRegistrationRepository extends MongoRepository<ContestRegistration, String> {
    List<ContestRegistration> findByContestId(String contestId);
    List<ContestRegistration> findByParticipantId(String participantId);
    Optional<ContestRegistration> findByContestIdAndParticipantId(String contestId, String participantId);
}
