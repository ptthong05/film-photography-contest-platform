package com.example.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.RegistrationRequest;
import com.example.backend.dto.RegistrationResponse;
import com.example.backend.enums.RegistrationStatus;
import com.example.backend.service.ContestRegistrationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/registrations")
public class ContestRegistrationController {

    private final ContestRegistrationService registrationService;

    public ContestRegistrationController(ContestRegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping
    public ResponseEntity<RegistrationResponse> registerForContest(@Valid @RequestBody RegistrationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(registrationService.registerForContest(request));
    }

    @GetMapping("/contest/{contestId}")
    public ResponseEntity<List<RegistrationResponse>> getRegistrationsByContest(
            @PathVariable Long contestId,
            @RequestParam(required = false) RegistrationStatus status) {
        return ResponseEntity.ok(registrationService.getRegistrationsByContest(contestId, status));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RegistrationResponse>> getRegistrationsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(registrationService.getRegistrationsByUser(userId));
    }

    @PatchMapping("/{id}/review")
    public ResponseEntity<RegistrationResponse> reviewRegistration(
            @PathVariable Long id,
            @RequestParam RegistrationStatus status,
            @RequestParam(required = false) String note) {
        return ResponseEntity.ok(registrationService.reviewRegistration(id, status, note));
    }
}