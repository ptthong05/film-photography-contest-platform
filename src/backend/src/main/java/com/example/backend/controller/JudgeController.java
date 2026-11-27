package com.example.backend.controller;

import com.example.backend.dto.EvaluationHistoryResponse;
import com.example.backend.dto.EvaluationRequest;
import com.example.backend.dto.EvaluationResponse;
import com.example.backend.dto.JudgeContestResponse;
import com.example.backend.dto.JudgeProfileRequest;
import com.example.backend.dto.JudgeProfileResponse;
import com.example.backend.dto.JudgeSubmissionResponse;
import com.example.backend.security.AuthenticatedUser;
import com.example.backend.service.JudgeProfileService;
import com.example.backend.service.JudgeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * API của giám khảo đang đăng nhập. Đặt dưới /api/judge/** để SecurityConfig chặn role, thêm @PreAuthorize để chỉ JUDGE
 * (ADMIN không có phân công nên không cần vào đây). Phạm vi bài được kiểm tra trong JudgeService.
 */
@RestController
@RequestMapping("/api/judge/me")
@PreAuthorize("hasRole('JUDGE')")
public class JudgeController {

    private final JudgeService judgeService;
    private final JudgeProfileService profileService;

    public JudgeController(JudgeService judgeService, JudgeProfileService profileService) {
        this.judgeService = judgeService;
        this.profileService = profileService;
    }

    @GetMapping("/profile")
    public ResponseEntity<JudgeProfileResponse> getProfile(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(profileService.getProfile(currentUser.id()));
    }

    @PutMapping("/profile")
    public ResponseEntity<JudgeProfileResponse> updateProfile(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @Valid @RequestBody JudgeProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(currentUser.id(), request));
    }

    @GetMapping("/contests")
    public ResponseEntity<List<JudgeContestResponse>> getAssignedContests(
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(judgeService.getAssignedContests(currentUser.id()));
    }

    @GetMapping("/evaluations")
    public ResponseEntity<List<EvaluationResponse>> getEvaluations(
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(judgeService.getEvaluations(currentUser.id()));
    }

    @GetMapping("/submissions")
    public ResponseEntity<List<JudgeSubmissionResponse>> getAssignedSubmissions(
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(judgeService.getAssignedSubmissions(currentUser.id()));
    }

    @GetMapping("/submissions/{submissionId}")
    public ResponseEntity<JudgeSubmissionResponse> getAssignedSubmission(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String submissionId) {
        return ResponseEntity.ok(judgeService.getAssignedSubmission(currentUser.id(), submissionId));
    }

    /** Chưa chấm → 200 với body rỗng (frontend nhận null) */
    @GetMapping("/submissions/{submissionId}/evaluation")
    public ResponseEntity<EvaluationResponse> getEvaluation(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String submissionId) {
        return ResponseEntity.ok(judgeService.getEvaluation(currentUser.id(), submissionId));
    }

    @GetMapping("/submissions/{submissionId}/evaluation-history")
    public ResponseEntity<List<EvaluationHistoryResponse>> getEvaluationHistory(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String submissionId) {
        return ResponseEntity.ok(judgeService.getEvaluationHistory(currentUser.id(), submissionId));
    }

    @PutMapping("/submissions/{submissionId}/evaluation")
    public ResponseEntity<EvaluationResponse> saveEvaluation(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String submissionId,
            @Valid @RequestBody EvaluationRequest request) {
        return ResponseEntity.ok(judgeService.saveEvaluation(currentUser.id(), submissionId, request));
    }
}
