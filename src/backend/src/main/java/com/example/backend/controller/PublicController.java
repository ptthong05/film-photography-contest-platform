package com.example.backend.controller;

import com.example.backend.dto.ArchiveEntryResponse;
import com.example.backend.dto.LeaderboardEntryResponse;
import com.example.backend.dto.PublicStatsResponse;
import com.example.backend.service.PublicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** API công khai cho trang chủ, bảng xếp hạng và kho ảnh đạt giải; không cần đăng nhập. */
@RestController
@RequestMapping("/api")
public class PublicController {

    private final PublicService publicService;

    public PublicController(PublicService publicService) {
        this.publicService = publicService;
    }

    @GetMapping("/public/stats")
    public ResponseEntity<PublicStatsResponse> getStats() {
        return ResponseEntity.ok(publicService.getStats());
    }

    @GetMapping("/public/leaderboard")
    public ResponseEntity<List<LeaderboardEntryResponse>> getLeaderboard() {
        return ResponseEntity.ok(publicService.getLeaderboard());
    }

    @GetMapping("/archive")
    public ResponseEntity<List<ArchiveEntryResponse>> getArchive(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String contestId) {
        return ResponseEntity.ok(publicService.getArchive(year, contestId));
    }
}
