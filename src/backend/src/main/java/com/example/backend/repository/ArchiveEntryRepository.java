package com.example.backend.repository;

import com.example.backend.entity.ArchiveEntry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArchiveEntryRepository extends MongoRepository<ArchiveEntry, String> {
    List<ArchiveEntry> findByYear(int year);
    List<ArchiveEntry> findByContestId(String contestId);
    boolean existsBySubmissionId(String submissionId);
}
