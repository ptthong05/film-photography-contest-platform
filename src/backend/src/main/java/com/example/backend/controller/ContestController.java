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

import com.example.backend.dto.ContestRequest;
import com.example.backend.dto.ContestResponse;
import com.example.backend.enums.ContestStatus;
import com.example.backend.service.ContestService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/contests")
public class ContestController {

    private final ContestService contestService;

    public ContestController(ContestService contestService) {
        this.contestService = contestService;
    }

    @GetMapping
    public ResponseEntity<List<ContestResponse>> getAllContests(
            @RequestParam(required = false) ContestStatus status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(contestService.getAllContests(status, categoryId, keyword));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContestResponse> getContestById(@PathVariable Long id) {
        return ResponseEntity.ok(contestService.getContestById(id));
    }

    @PostMapping
    public ResponseEntity<ContestResponse> createContest(@Valid @RequestBody ContestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contestService.createContest(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContestResponse> updateContest(@PathVariable Long id,

        @Valid @RequestBody ContestRequest request) {
        return ResponseEntity.ok(contestService.updateContest(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContest(@PathVariable Long id) {
        contestService.deleteContest(id);
        return ResponseEntity.noContent().build();
    }
}