package com.example.backend.repository;

import com.example.backend.entity.Contest;
import com.example.backend.enums.ContestStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContestRepository extends MongoRepository<Contest, String> {
    Optional<Contest> findBySlug(String slug);
    List<Contest> findByStatus(ContestStatus status);
    List<Contest> findByOrganizerId(String organizerId);
}
