package com.example.backend.controller;

import com.example.backend.dto.ContestResultResponse;
import com.example.backend.dto.ContestScoringResponse;
import com.example.backend.dto.PublishResultsRequest;
import com.example.backend.security.AuthenticatedUser;
import com.example.backend.service.ResultService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Tổng hợp điểm (ban tổ chức) và kết quả công bố (công khai) của một cuộc thi. */
@RestController
@RequestMapping("/api/contests/{contestId}")
public class ResultController {

    private final ResultService resultService;

    public ResultController(ResultService resultService) {
        this.resultService = resultService;
    }

    @GetMapping("/scoring")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<ContestScoringResponse> getScoring(@PathVariable Long contestId) {
        return ResponseEntity.ok(resultService.getScoring(contestId));
    }

    @GetMapping("/results")
    public ResponseEntity<List<ContestResultResponse>> getResults(@PathVariable Long contestId) {
        return ResponseEntity.ok(resultService.getPublished(contestId));
    }

    @PostMapping("/results")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<ContestScoringResponse> publish(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable Long contestId,
            @Valid @RequestBody PublishResultsRequest request) {
        return ResponseEntity.ok(resultService.publish(contestId, request, currentUser));
    }

    @DeleteMapping("/results")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<Void> unpublish(@PathVariable Long contestId) {
        resultService.unpublish(contestId);
        return ResponseEntity.noContent().build();
    }
}
