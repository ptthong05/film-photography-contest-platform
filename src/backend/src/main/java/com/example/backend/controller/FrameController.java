package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.service.FrameService;

import jakarta.validation.Valid;

import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Profile("tv3")
@RequestMapping("/api/film-rolls/{rollId}/frames")
public class FrameController {
    private final FrameService service;

    public FrameController(FrameService service) {
        this.service = service;
    }

    @GetMapping
    public List<FrameResponse> list(@PathVariable String rollId) {
        return service.list(rollId);
    }

    @GetMapping("/{id}")
    public FrameResponse get(@PathVariable String rollId, @PathVariable String id) {
        return service.get(rollId, id);
    }

    @PostMapping
    public ResponseEntity<FrameResponse> create(
            @PathVariable String rollId, @Valid @RequestBody FrameRequest q) {
        return ResponseEntity.status(201).body(service.create(rollId, q));
    }

    @PutMapping("/{id}")
    public FrameResponse update(
            @PathVariable String rollId,
            @PathVariable String id,
            @Valid @RequestBody FrameRequest q) {
        return service.update(rollId, id, q);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String rollId, @PathVariable String id) {
        service.delete(rollId, id);
        return ResponseEntity.noContent().build();
    }
}
