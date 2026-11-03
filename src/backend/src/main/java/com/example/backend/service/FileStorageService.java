package com.example.backend.service;

import com.example.backend.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;

/** Lưu ảnh upload ra thư mục cấu hình, DB chỉ giữ URL. Tên file do server sinh để tránh ghi đè và path traversal. */
@Service
public class FileStorageService {

    private static final Map<String, String> EXTENSION_BY_TYPE = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp",
            "image/tiff", ".tif");

    private final Path uploadDir;
    private final String publicBaseUrl;

    public FileStorageService(
            @Value("${app.upload.dir}") String uploadDir,
            @Value("${app.public-base-url}") String publicBaseUrl) {
        this.uploadDir = Path.of(uploadDir).toAbsolutePath().normalize();
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
    }

    public String storeImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Vui lòng chọn file ảnh");
        }
        String contentType = file.getContentType();
        String extension = contentType == null ? null : EXTENSION_BY_TYPE.get(contentType.toLowerCase());
        if (extension == null) {
            throw new BadRequestException("Chỉ hỗ trợ ảnh JPEG, PNG, WEBP hoặc TIFF");
        }
        String fileName = UUID.randomUUID() + extension;
        try {
            Files.createDirectories(uploadDir);
            file.transferTo(uploadDir.resolve(fileName));
        } catch (IOException ex) {
            throw new UncheckedIOException("Không lưu được file ảnh", ex);
        }
        return publicBaseUrl + "/uploads/" + fileName;
    }
}
