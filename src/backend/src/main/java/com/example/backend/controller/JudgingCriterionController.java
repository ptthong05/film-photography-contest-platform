package com.example.backend.controller;

import com.example.backend.dto.JudgingCriteriaRequest;
import com.example.backend.dto.JudgingCriterionResponse;
import com.example.backend.service.JudgingCriterionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Tiêu chí chấm của cuộc thi: ai cũng xem được (thể lệ công khai), chỉ ORGANIZER/ADMIN được sửa. */
@RestController
@RequestMapping("/api/contests/{contestId}/criteria")
public class JudgingCriterionController {

    private final JudgingCriterionService criterionService;

    public JudgingCriterionController(JudgingCriterionService criterionService) {
        this.criterionService = criterionService;
    }

    @GetMapping
    public ResponseEntity<List<JudgingCriterionResponse>> getByContest(@PathVariable Long contestId) {
        return ResponseEntity.ok(criterionService.getByContest(contestId));
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<List<JudgingCriterionResponse>> replace(
            @PathVariable Long contestId,
            @Valid @RequestBody JudgingCriteriaRequest request) {
        return ResponseEntity.ok(criterionService.replace(contestId, request));
    }
}
