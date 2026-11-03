package com.example.backend.controller;

import com.example.backend.dto.AssignmentRequest;
import com.example.backend.dto.AssignmentResponse;
import com.example.backend.dto.ReassignRequest;
import com.example.backend.security.AuthenticatedUser;
import com.example.backend.service.AssignmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping
    public ResponseEntity<List<AssignmentResponse>> getManaged(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(assignmentService.getManaged(currentUser));
    }

    @PostMapping
    public ResponseEntity<AssignmentResponse> assign(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assignmentService.assign(request, currentUser));
    }

    @PutMapping("/{id}/judge")
    public ResponseEntity<AssignmentResponse> reassign(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String id,
            @Valid @RequestBody ReassignRequest request) {
        return ResponseEntity.ok(assignmentService.reassign(id, request.judgeId(), currentUser));
    }

    @PostMapping("/{id}/remind")
    public ResponseEntity<AssignmentResponse> remind(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String id) {
        return ResponseEntity.ok(assignmentService.remind(id, currentUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> revoke(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String id) {
        assignmentService.revoke(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
