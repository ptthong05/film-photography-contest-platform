package com.example.backend.controller;

import com.example.backend.dto.RegistrationResponse;
import com.example.backend.security.AuthenticatedUser;
import com.example.backend.service.RegistrationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@PreAuthorize("hasRole('PARTICIPANT')")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @GetMapping("/registrations/mine")
    public ResponseEntity<List<RegistrationResponse>> getMine(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(registrationService.getMine(currentUser.id()));
    }

    @PostMapping("/contests/{contestId}/registrations")
    public ResponseEntity<RegistrationResponse> register(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String contestId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(registrationService.register(contestId, currentUser));
    }

    @DeleteMapping("/contests/{contestId}/registrations")
    public ResponseEntity<Void> cancel(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String contestId) {
        registrationService.cancel(contestId, currentUser);
        return ResponseEntity.noContent().build();
    }
}
