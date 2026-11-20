package com.example.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.backend.dto.DigitalArchiveRequest;
import com.example.backend.dto.DigitalArchiveResponse;
import com.example.backend.entity.Contest;
import com.example.backend.entity.DigitalArchive;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ContestRepository;
import com.example.backend.repository.DigitalArchiveRepository;

@Service
public class DigitalArchiveService {

    private final DigitalArchiveRepository archiveRepository;
    private final ContestRepository contestRepository;

    public DigitalArchiveService(DigitalArchiveRepository archiveRepository, ContestRepository contestRepository) {
        this.archiveRepository = archiveRepository;
        this.contestRepository = contestRepository;
    }

    public List<DigitalArchiveResponse> getAllArchives(Integer year, String awardName, String keyword) {
        List<DigitalArchive> archives;

        if (keyword != null && !keyword.trim().isEmpty()) {
            archives = archiveRepository.findByTitleContainingIgnoreCase(keyword.trim());
        } else if (year != null) {
            archives = archiveRepository.findByArchiveYear(year);
        } else if (awardName != null && !awardName.trim().isEmpty()) {
            archives = archiveRepository.findByAwardNameContainingIgnoreCase(awardName.trim());
        } else {
            archives = archiveRepository.findAllByOrderByArchiveYearDescCreatedAtDesc();
        }

        return archives.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public DigitalArchiveResponse getArchiveById(Long id) {
        DigitalArchive archive = archiveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tác phẩm lưu trữ với id: " + id));
        return toResponse(archive);
    }

    public DigitalArchiveResponse createArchive(DigitalArchiveRequest request) {
        DigitalArchive archive = new DigitalArchive();
        mapRequestToEntity(request, archive);

        DigitalArchive saved = archiveRepository.save(archive);
        return toResponse(saved);
    }

    public DigitalArchiveResponse updateArchive(Long id, DigitalArchiveRequest request) {
        DigitalArchive archive = archiveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tác phẩm lưu trữ với id: " + id));

        mapRequestToEntity(request, archive);

        DigitalArchive updated = archiveRepository.save(archive);
        return toResponse(updated);
    }

    public void deleteArchive(Long id) {
        DigitalArchive archive = archiveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tác phẩm lưu trữ với id: " + id));
        archiveRepository.delete(archive);
    }

    private void mapRequestToEntity(DigitalArchiveRequest request, DigitalArchive archive) {
        archive.setTitle(request.getTitle().trim());
        archive.setImageUrl(request.getImageUrl().trim());
        archive.setArchiveYear(request.getArchiveYear());
        archive.setAwardName(request.getAwardName());
        archive.setAuthorId(request.getAuthorId());
        archive.setDescription(request.getDescription());

        if (request.getContestId() != null) {
            Contest contest = contestRepository.findById(request.getContestId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc thi với id: " + request.getContestId()));
            archive.setContest(contest);
        } else {
            archive.setContest(null);
        }
    }

    private DigitalArchiveResponse toResponse(DigitalArchive archive) {
        DigitalArchiveResponse response = new DigitalArchiveResponse();
        response.setId(archive.getId());
        response.setTitle(archive.getTitle());
        response.setImageUrl(archive.getImageUrl());
        response.setArchiveYear(archive.getArchiveYear());
        response.setAwardName(archive.getAwardName());
        if (archive.getContest() != null) {
            response.setContestId(archive.getContest().getId());
            response.setContestTitle(archive.getContest().getTitle());
        }
        response.setAuthorId(archive.getAuthorId());
        response.setDescription(archive.getDescription());
        response.setCreatedAt(archive.getCreatedAt());
        return response;
    }
}