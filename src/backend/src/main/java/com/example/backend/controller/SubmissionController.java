package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.service.SubmissionService;

import jakarta.validation.Valid;

import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@Profile("tv3")
@RequestMapping("/api/submissions")
public class SubmissionController {
    private final SubmissionService service;

    public SubmissionController(SubmissionService service) {
        this.service = service;
    }

    @GetMapping("/mine")
    public List<SubmissionResponse> mine() {
        return service.mine();
    }

    @GetMapping
    public List<SubmissionResponse> managed(@RequestParam(required = false) String contestId) {
        return service.managed(contestId);
    }

    @GetMapping("/{id}")
    public SubmissionResponse get(@PathVariable String id) {
        return service.get(id);
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<SubmissionResponse> create(
            @Valid @ModelAttribute SubmissionRequest q,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "negativeFile", required = false) MultipartFile negative) {
        return ResponseEntity.status(201).body(service.create(q, file, negative));
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public SubmissionResponse update(
            @PathVariable String id,
            @Valid @ModelAttribute SubmissionRequest q,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "negativeFile", required = false) MultipartFile negative) {
        return service.update(id, q, file, negative);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public SubmissionResponse review(
            @PathVariable String id, @Valid @RequestBody SubmissionStatusRequest q) {
        return service.review(id, q);
    }
}
