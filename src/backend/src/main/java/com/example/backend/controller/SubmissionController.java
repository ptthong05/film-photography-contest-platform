package com.example.backend.controller;

import com.example.backend.dto.MyResultResponse;
import com.example.backend.dto.SubmissionRequest;
import com.example.backend.dto.SubmissionResponse;
import com.example.backend.dto.SubmissionStatusRequest;
import com.example.backend.security.AuthenticatedUser;
import com.example.backend.service.ResultService;
import com.example.backend.service.SubmissionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private static final String MANAGE_ROLES = "hasAnyRole('ORGANIZER', 'ADMIN')";

    private final SubmissionService submissionService;
    private final ResultService resultService;

    public SubmissionController(SubmissionService submissionService, ResultService resultService) {
        this.submissionService = submissionService;
        this.resultService = resultService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PARTICIPANT')")
    public ResponseEntity<SubmissionResponse> submit(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @Valid @ModelAttribute SubmissionRequest request,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "negativeFile", required = false) MultipartFile negativeFile) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(submissionService.submit(request, file, negativeFile, currentUser));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('PARTICIPANT')")
    public ResponseEntity<List<SubmissionResponse>> getMine(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(submissionService.getMine(currentUser.id()));
    }

    @GetMapping("/mine/results")
    @PreAuthorize("hasRole('PARTICIPANT')")
    public ResponseEntity<List<MyResultResponse>> getMyResults(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(resultService.getMyResults(currentUser.id()));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PARTICIPANT')")
    public ResponseEntity<SubmissionResponse> updateMine(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String id,
            @Valid @ModelAttribute SubmissionRequest request,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(submissionService.updateMine(id, request, file, currentUser));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PARTICIPANT')")
    public ResponseEntity<Void> deleteMine(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String id) {
        submissionService.deleteMine(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @PreAuthorize(MANAGE_ROLES)
    public ResponseEntity<List<SubmissionResponse>> getManaged(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @RequestParam(required = false) String contestId) {
        return ResponseEntity.ok(submissionService.getManaged(contestId, currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubmissionResponse> getOne(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String id) {
        return ResponseEntity.ok(submissionService.getOne(id, currentUser));
    }

    /** Duyệt / từ chối bằng tay (Manual Review) */
    @PatchMapping("/{id}/status")
    @PreAuthorize(MANAGE_ROLES)
    public ResponseEntity<SubmissionResponse> updateStatus(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String id,
            @Valid @RequestBody SubmissionStatusRequest request) {
        return ResponseEntity.ok(submissionService.updateStatus(id, request.status(), request.reason(), currentUser));
    }
}
