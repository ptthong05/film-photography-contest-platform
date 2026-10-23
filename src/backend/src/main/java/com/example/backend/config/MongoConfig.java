package com.example.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/** Bật auditing để @CreatedDate / @LastModifiedDate trong BaseDocument tự điền thời gian. */
@Configuration
@EnableMongoAuditing
public class MongoConfig {
}
