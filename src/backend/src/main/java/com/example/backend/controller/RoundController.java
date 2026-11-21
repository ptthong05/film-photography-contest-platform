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
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.RoundRequest;
import com.example.backend.dto.RoundResponse;
import com.example.backend.service.RoundService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rounds")
public class RoundController {

    private final RoundService roundService;

    public RoundController(RoundService roundService) {
        this.roundService = roundService;
    }

    @GetMapping("/contest/{contestId}")
    public ResponseEntity<List<RoundResponse>> getRoundsByContestId(@PathVariable Long contestId) {
        return ResponseEntity.ok(roundService.getRoundsByContestId(contestId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoundResponse> getRoundById(@PathVariable Long id) {
        return ResponseEntity.ok(roundService.getRoundById(id));
    }

    @PostMapping
    public ResponseEntity<RoundResponse> createRound(@Valid @RequestBody RoundRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roundService.createRound(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoundResponse> updateRound(@PathVariable Long id,

        @Valid @RequestBody RoundRequest request) {
        return ResponseEntity.ok(roundService.updateRound(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRound(@PathVariable Long id) {
        roundService.deleteRound(id);
        return ResponseEntity.noContent().build();
    }
}