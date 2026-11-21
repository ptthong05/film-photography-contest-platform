package com.example.backend.storage;

import com.cloudinary.Cloudinary;
import com.example.backend.exception.Tv3Exception;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Component
@Profile("tv3")
public class CloudinaryStorage implements ImageStorage {
    private static final java.util.regex.Pattern OWNED_ID =
            java.util.regex.Pattern.compile(
                    "filmcontest-tv3/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}");
    private final Cloudinary cloud;
    private final boolean configured;

    @org.springframework.beans.factory.annotation.Autowired
    public CloudinaryStorage(
            @Value("${tv3.cloudinary.cloud-name:}") String name,
            @Value("${tv3.cloudinary.api-key:}") String key,
            @Value("${tv3.cloudinary.api-secret:}") String secret) {
        configured = !name.isBlank() && !key.isBlank() && !secret.isBlank();
        cloud =
                new Cloudinary(
                        Map.of(
                                "cloud_name",
                                name,
                                "api_key",
                                key,
                                "api_secret",
                                secret,
                                "secure",
                                true));
    }

    CloudinaryStorage(Cloudinary cloud, boolean configured) {
        this.cloud = cloud;
        this.configured = configured;
    }

    public Asset upload(byte[] bytes) {
        if (!configured) throw new Tv3Exception(503, "Chưa cấu hình Cloudinary");
        String id = "filmcontest-tv3/" + UUID.randomUUID();
        try {
            Map<?, ?> result =
                    cloud.uploader()
                            .upload(
                                    bytes,
                                    Map.of(
                                            "public_id",
                                            id,
                                            "resource_type",
                                            "image",
                                            "overwrite",
                                            false));
            Object url = result.get("secure_url");
            if (!(url instanceof String value) || !value.startsWith("https://"))
                throw new IOException("Missing secure URL");
            return new Asset(value, id);
        } catch (IOException | RuntimeException e) {
            // Timeout may occur AFTER provider accepted the upload. Compensation is idempotent.
            try {
                delete(id);
            } catch (RuntimeException cleanup) {
                org.slf4j.LoggerFactory.getLogger(getClass())
                        .error("Cloud cleanup requires retry: {}", id);
            }
            throw new Tv3Exception(502, "Upload ảnh thất bại");
        }
    }

    public void delete(String id) {
        if (id == null) return;
        if (!OWNED_ID.matcher(id).matches())
            throw new Tv3Exception(400, "Tài nguyên ảnh không thuộc namespace TV3");
        if (!configured) throw new Tv3Exception(503, "Chưa cấu hình Cloudinary");
        try {
            Map<?, ?> result =
                    cloud.uploader()
                            .destroy(id, Map.of("resource_type", "image", "invalidate", true));
            if (result == null
                    || !("ok".equals(result.get("result"))
                            || "not found".equals(result.get("result"))))
                throw new IOException("Cloud resource deletion was not confirmed");
        } catch (IOException | RuntimeException e) {
            throw new Tv3Exception(502, "Xóa tài nguyên cloud thất bại");
        }
    }
}
