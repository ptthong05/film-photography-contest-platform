package com.example.backend.service;

import com.example.backend.entity.ActivityLog;
import com.example.backend.enums.Role;
import com.example.backend.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/** Ghi nhật ký thao tác để Admin tra cứu. */
@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    public void log(String actorId, Role actorRole, String action, String targetType, String targetId, String details) {
        ActivityLog log = new ActivityLog();
        log.setActorId(actorId);
        log.setActorRole(actorRole);
        log.setAction(action);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setDetails(details);
        activityLogRepository.save(log);
    }

    public List<ActivityLog> getRecent() {
        return activityLogRepository.findTop100ByOrderByCreatedAtDesc();
    }
}
