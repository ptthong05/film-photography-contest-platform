package com.example.backend.controller;

import com.example.backend.dto.FilmRollRequest;
import com.example.backend.dto.FilmRollResponse;
import com.example.backend.entity.FilmRoll;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.FilmRollRepository;
import com.example.backend.security.AuthenticatedUser;
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

import java.util.ArrayList;
import java.util.List;

/** Cuộn phim của chính thí sinh đang đăng nhập; cuộn của người khác trả 404. */
@RestController
@RequestMapping("/api/film-rolls")
@PreAuthorize("hasRole('PARTICIPANT')")
public class FilmRollController {

    private final FilmRollRepository filmRollRepository;

    public FilmRollController(FilmRollRepository filmRollRepository) {
        this.filmRollRepository = filmRollRepository;
    }

    @GetMapping
    public ResponseEntity<List<FilmRollResponse>> getMine(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(filmRollRepository.findByParticipantId(currentUser.id()).stream()
                .map(FilmRollResponse::fromEntity)
                .toList());
    }

    @PostMapping
    public ResponseEntity<FilmRollResponse> create(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @Valid @RequestBody FilmRollRequest request) {
        FilmRoll roll = new FilmRoll();
        roll.setParticipantId(currentUser.id());
        apply(roll, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(FilmRollResponse.fromEntity(filmRollRepository.save(roll)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FilmRollResponse> update(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String id,
            @Valid @RequestBody FilmRollRequest request) {
        FilmRoll roll = requireOwned(id, currentUser);
        apply(roll, request);
        return ResponseEntity.ok(FilmRollResponse.fromEntity(filmRollRepository.save(roll)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String id) {
        filmRollRepository.delete(requireOwned(id, currentUser));
        return ResponseEntity.noContent().build();
    }

    private FilmRoll requireOwned(String id, AuthenticatedUser currentUser) {
        return filmRollRepository.findById(id)
                .filter(roll -> currentUser.id().equals(roll.getParticipantId()))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộn phim"));
    }

    private static void apply(FilmRoll roll, FilmRollRequest request) {
        roll.setName(request.name().trim());
        roll.setBrand(request.brand());
        roll.setIso(request.iso());
        roll.setFormat(request.format());
        roll.setCameraBody(request.cameraBody());
        roll.setTotalFrames(request.totalFrames());
        if (request.usedFrameNumbers() != null) {
            roll.setUsedFrameNumbers(new ArrayList<>(request.usedFrameNumbers()));
        }
    }
}
