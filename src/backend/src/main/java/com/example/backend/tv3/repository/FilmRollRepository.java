package com.example.backend.tv3.repository;

import com.example.backend.tv3.entity.FilmRoll;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.*;

public interface FilmRollRepository extends JpaRepository<FilmRoll, String> {
    List<FilmRoll> findByParticipantId(String participantId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from FilmRoll r where r.id=:id")
    Optional<FilmRoll> lockById(@Param("id") String id);
}
