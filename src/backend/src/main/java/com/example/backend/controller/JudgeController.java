package com.example.backend.controller;

import com.example.backend.dto.EvaluationHistoryResponse;
import com.example.backend.dto.EvaluationRequest;
import com.example.backend.dto.EvaluationResponse;
import com.example.backend.dto.JudgeContestResponse;
import com.example.backend.dto.JudgeSubmissionResponse;
import com.example.backend.security.AuthenticatedUser;
import com.example.backend.service.JudgeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** API của giám khảo đang đăng nhập (chỉ role JUDGE, xem SecurityConfig). Phạm vi bài được kiểm tra trong JudgeService. */
@RestController
@RequestMapping("/api/judges/me")
public class JudgeController {

    private final JudgeService judgeService;

    public JudgeController(JudgeService judgeService) {
        this.judgeService = judgeService;
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
