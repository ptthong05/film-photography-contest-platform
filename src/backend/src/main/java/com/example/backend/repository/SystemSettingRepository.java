package com.example.backend.repository;

import com.example.backend.entity.SystemSetting;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface SystemSettingRepository extends MongoRepository<SystemSetting, String> {

    Optional<SystemSetting> findByKey(String key);
}
