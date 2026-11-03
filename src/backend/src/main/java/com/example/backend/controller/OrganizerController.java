package com.example.backend.controller;

import com.example.backend.dto.OrganizerJudgeRequest;
import com.example.backend.dto.OrganizerJudgeResponse;
import com.example.backend.dto.OrganizerParticipantResponse;
import com.example.backend.dto.ReportResponse;
import com.example.backend.dto.UserStatusRequest;
import com.example.backend.security.AuthenticatedUser;
import com.example.backend.service.OrganizerUserService;
import com.example.backend.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Quyền theo URL: ORGANIZER và ADMIN (xem SecurityConfig). */
@RestController
@RequestMapping("/api/organizer")
public class OrganizerController {

    private final OrganizerUserService organizerUserService;
    private final ReportService reportService;

    public OrganizerController(OrganizerUserService organizerUserService, ReportService reportService) {
        this.organizerUserService = organizerUserService;
        this.reportService = reportService;
    }

    @GetMapping("/reports")
    public ResponseEntity<ReportResponse> getReport(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @RequestParam(required = false) String contestId) {
        return ResponseEntity.ok(reportService.getReport(currentUser, contestId));
    }

    @GetMapping("/judges")
    public ResponseEntity<List<OrganizerJudgeResponse>> getJudges() {
        return ResponseEntity.ok(organizerUserService.getJudges());
    }

    @PostMapping("/judges")
    public ResponseEntity<OrganizerJudgeResponse> createJudge(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @Valid @RequestBody OrganizerJudgeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(organizerUserService.createJudge(request, currentUser));
    }

    @PatchMapping("/judges/{id}/default")
    public ResponseEntity<OrganizerJudgeResponse> setDefaultJudge(@PathVariable String id, @RequestParam boolean isDefault) {
        return ResponseEntity.ok(organizerUserService.setDefaultJudge(id, isDefault));
    }

    @GetMapping("/participants")
    public ResponseEntity<List<OrganizerParticipantResponse>> getParticipants(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(organizerUserService.getParticipants(currentUser));
    }

    @PatchMapping("/participants/{id}/status")
    public ResponseEntity<OrganizerParticipantResponse> updateParticipantStatus(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String id,
            @Valid @RequestBody UserStatusRequest request) {
        return ResponseEntity.ok(organizerUserService.updateParticipantStatus(id, request.status(), currentUser));
    }
}
