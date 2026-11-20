package com.example.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.ContestRegistration;
import com.example.backend.enums.RegistrationStatus;

@Repository
public interface ContestRegistrationRepository extends JpaRepository<ContestRegistration, Long> {
    boolean existsByContestIdAndUserId(Long contestId, Long userId);
    Optional<ContestRegistration> findByContestIdAndUserId(Long contestId, Long userId);
    List<ContestRegistration> findByContestId(Long contestId);
    List<ContestRegistration> findByContestIdAndStatus(Long contestId, RegistrationStatus status);
    List<ContestRegistration> findByUserId(Long userId);
}