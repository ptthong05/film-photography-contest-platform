package com.example.backend.controller;

import com.example.backend.dto.AwardArchiveResponse;
import com.example.backend.service.ResultService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Tác phẩm đạt giải của mọi cuộc thi đã công bố kết quả. Đọc thẳng contest_results nên luôn khớp với lần công bố
 * mới nhất (huỷ công bố thì tác phẩm tự rời kho). Mọi tài khoản đã đăng nhập đều xem được.
 */
@RestController
@RequestMapping("/api/results/awards")
public class AwardArchiveController {

    private final ResultService resultService;

    public AwardArchiveController(ResultService resultService) {
        this.resultService = resultService;
    }

    @GetMapping
    public ResponseEntity<List<AwardArchiveResponse>> getAwardArchive() {
        return ResponseEntity.ok(resultService.getAwardArchive());
    }
}
