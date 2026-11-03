package com.example.backend.controller;

import com.example.backend.dto.ActivityLogResponse;
import com.example.backend.entity.ActivityLog;
import com.example.backend.entity.BaseDocument;
import com.example.backend.entity.SystemSetting;
import com.example.backend.entity.User;
import com.example.backend.repository.SystemSettingRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.AuthenticatedUser;
import com.example.backend.service.ActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Nhật ký và cấu hình hệ thống; chỉ Admin (xem SecurityConfig). */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ActivityLogService activityLogService;
    private final UserRepository userRepository;
    private final SystemSettingRepository settingRepository;

    public AdminController(
            ActivityLogService activityLogService,
            UserRepository userRepository,
            SystemSettingRepository settingRepository) {
        this.activityLogService = activityLogService;
        this.userRepository = userRepository;
        this.settingRepository = settingRepository;
    }

    @GetMapping("/logs")
    public ResponseEntity<List<ActivityLogResponse>> getLogs() {
        List<ActivityLog> logs = activityLogService.getRecent();
        Map<String, User> actors = userRepository
                .findAllById(logs.stream().map(ActivityLog::getActorId).filter(Objects::nonNull).collect(Collectors.toSet())).stream()
                .collect(Collectors.toMap(BaseDocument::getId, Function.identity()));
        return ResponseEntity.ok(logs.stream().map(log -> {
            User actor = actors.get(log.getActorId());
            return new ActivityLogResponse(log.getId(), log.getActorId(), actor == null ? null : actor.getName(),
                    actor == null ? null : actor.getEmail(), log.getActorRole(), log.getAction(), log.getTargetType(),
                    log.getTargetId(), log.getDetails(), log.getCreatedAt());
        }).toList());
    }

    /** Chưa lưu lần nào → object rỗng, giao diện dùng giá trị mặc định của nó */
    @GetMapping("/settings/{key}")
    public ResponseEntity<Map<String, Object>> getSetting(@PathVariable String key) {
        return ResponseEntity.ok(settingRepository.findByKey(key).map(SystemSetting::getValue).orElse(Map.of()));
    }

    @PutMapping("/settings/{key}")
    public ResponseEntity<Map<String, Object>> saveSetting(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable String key,
            @RequestBody Map<String, Object> value) {
        SystemSetting setting = settingRepository.findByKey(key).orElseGet(() -> {
            SystemSetting created = new SystemSetting();
            created.setKey(key);
            return created;
        });
        setting.setValue(value);
        settingRepository.save(setting);
        activityLogService.log(currentUser.id(), currentUser.role(), "SETTING_UPDATE", "SETTING", key, null);
        return ResponseEntity.ok(value);
    }
}
