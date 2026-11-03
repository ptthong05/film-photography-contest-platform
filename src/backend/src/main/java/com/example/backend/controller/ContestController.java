package com.example.backend.controller;

import com.example.backend.dto.ContestRequest;
import com.example.backend.dto.ContestResponse;
import com.example.backend.dto.ContestResultResponse;
import com.example.backend.dto.ContestStatusRequest;
import com.example.backend.security.AuthenticatedUser;
import com.example.backend.service.ContestService;
import com.example.backend.service.ResultService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** GET danh sách, chi tiết, kết quả là công khai (xem SecurityConfig); thao tác quản lý cho Organizer và Admin. */
@RestController
@RequestMapping("/api/contests")
public class ContestController {

    private static final String MANAGE_ROLES = "hasAnyRole('ORGANIZER', 'ADMIN')";

    private final ContestService contestService;
    private final ResultService resultService;

    public ContestController(ContestService contestService, ResultService resultService) {
        this.contestService = contestService;
        this.resultService = resultService;
    }

    @GetMapping
    public ResponseEntity<List<ContestResponse>> getPublicContests() {
        return ResponseEntity.ok(contestService.getPublicContests());
    }

    @GetMapping("/managed")
    @PreAuthorize(MANAGE_ROLES)
    public ResponseEntity<List<ContestResponse>> getManagedContests(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(contestService.getManagedContests(currentUser));
    }

    @GetMapping("/managed/results")
    @PreAuthorize(MANAGE_ROLES)
    public ResponseEntity<List<ContestResultResponse>> getManagedResults(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(resultService.getManagedResults(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContestResponse> getContest(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String id) {
        return ResponseEntity.ok(contestService.getContest(id, currentUser));
    }

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<ContestResponse> create(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @Valid @RequestBody ContestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contestService.create(request, currentUser));
    }

    @PutMapping("/{id}")
    @PreAuthorize(MANAGE_ROLES)
    public ResponseEntity<ContestResponse> update(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String id,
            @Valid @RequestBody ContestRequest request) {
        return ResponseEntity.ok(contestService.update(id, request, currentUser));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize(MANAGE_ROLES)
    public ResponseEntity<ContestResponse> updateStatus(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String id,
            @Valid @RequestBody ContestStatusRequest request) {
        return ResponseEntity.ok(contestService.updateStatus(id, request.status(), currentUser));
    }

    @PatchMapping("/{id}/archive")
    @PreAuthorize(MANAGE_ROLES)
    public ResponseEntity<ContestResponse> setArchived(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String id,
            @RequestParam boolean archived) {
        return ResponseEntity.ok(contestService.setArchived(id, archived, currentUser));
    }

    @PostMapping("/{id}/duplicate")
    @PreAuthorize(MANAGE_ROLES)
    public ResponseEntity<ContestResponse> duplicate(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String id) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contestService.duplicate(id, currentUser));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(MANAGE_ROLES)
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String id) {
        contestService.delete(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    /** Chưa công bố → mảng rỗng */
    @GetMapping("/{id}/results")
    public ResponseEntity<List<ContestResultResponse>> getResults(@PathVariable String id) {
        return ResponseEntity.ok(resultService.getPublishedResults(id));
    }

    @PostMapping("/{id}/results/publish")
    @PreAuthorize(MANAGE_ROLES)
    public ResponseEntity<List<ContestResultResponse>> publishResults(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String id) {
        return ResponseEntity.ok(resultService.publish(id, currentUser));
    }

    @DeleteMapping("/{id}/results/publish")
    @PreAuthorize(MANAGE_ROLES)
    public ResponseEntity<Void> unpublishResults(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String id) {
        resultService.unpublish(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
