package com.example.backend.repository;

import com.example.backend.entity.JudgeProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JudgeProfileRepository extends JpaRepository<JudgeProfile, String> {

    Optional<JudgeProfile> findByUserId(String userId);
}
