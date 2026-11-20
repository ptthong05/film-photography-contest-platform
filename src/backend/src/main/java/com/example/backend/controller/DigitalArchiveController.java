package com.example.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.DigitalArchiveRequest;
import com.example.backend.dto.DigitalArchiveResponse;
import com.example.backend.service.DigitalArchiveService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/archives")
public class DigitalArchiveController {

    private final DigitalArchiveService archiveService;

    public DigitalArchiveController(DigitalArchiveService archiveService) {
        this.archiveService = archiveService;
    }

    @GetMapping
    public ResponseEntity<List<DigitalArchiveResponse>> getAllArchives(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String awardName,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(archiveService.getAllArchives(year, awardName, keyword));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DigitalArchiveResponse> getArchiveById(@PathVariable Long id) {
        return ResponseEntity.ok(archiveService.getArchiveById(id));
    }

    @PostMapping
    public ResponseEntity<DigitalArchiveResponse> createArchive(@Valid @RequestBody DigitalArchiveRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(archiveService.createArchive(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DigitalArchiveResponse> updateArchive(@PathVariable Long id,
                                                                @Valid @RequestBody DigitalArchiveRequest request) {
        return ResponseEntity.ok(archiveService.updateArchive(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArchive(@PathVariable Long id) {
        archiveService.deleteArchive(id);
        return ResponseEntity.noContent().build();
    }
}