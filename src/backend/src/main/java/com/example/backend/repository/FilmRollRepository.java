package com.example.backend.repository;

import com.example.backend.entity.FilmRoll;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface FilmRollRepository extends MongoRepository<FilmRoll, String> {

    List<FilmRoll> findByParticipantId(String participantId);
}
