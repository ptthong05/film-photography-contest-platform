package com.example.backend.entity;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashMap;
import java.util.Map;

/** Cấu hình hệ thống do Admin chỉnh; mỗi nhóm cấu hình là 1 document (vd. "system", "ai"). */
@Document(collection = "system_settings")
public class SystemSetting extends BaseDocument {

    @Indexed(unique = true)
    private String key;
    private Map<String, Object> value = new HashMap<>();

    public SystemSetting() {
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public Map<String, Object> getValue() {
        return value;
    }

    public void setValue(Map<String, Object> value) {
        this.value = value;
    }
}
