package com.example.backend.tv3.web;

import com.example.backend.tv3.dto.*;
import com.example.backend.tv3.service.FilmRollService;

import jakarta.validation.Valid;

import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Profile("tv3")
@RequestMapping("/api/film-rolls")
public class FilmRollController {
    private final FilmRollService service;

    public FilmRollController(FilmRollService service) {
        this.service = service;
    }

    @GetMapping
    public List<FilmRollResponse> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public FilmRollResponse get(@PathVariable String id) {
        return service.get(id);
    }

    @PostMapping
    public ResponseEntity<FilmRollResponse> create(@Valid @RequestBody FilmRollRequest q) {
        return ResponseEntity.status(201).body(service.create(q));
    }

    @PutMapping("/{id}")
    public FilmRollResponse update(@PathVariable String id, @Valid @RequestBody FilmRollRequest q) {
        return service.update(id, q);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
