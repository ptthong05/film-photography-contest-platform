package com.example.backend.storage;

import com.example.backend.exception.Tv3Exception;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.Set;

import javax.imageio.ImageIO;

@Component
@Profile("tv3")
public class ImageValidator {
    private final long maxBytes;
    private final long maxPixels;

    public ImageValidator(
            @Value("${tv3.upload.max-bytes:20971520}") long maxBytes,
            @Value("${tv3.upload.max-pixels:60000000}") long maxPixels) {
        if (maxBytes < 1 || maxBytes >= Integer.MAX_VALUE || maxPixels < 1)
            throw new IllegalArgumentException("Giới hạn dung lượng/pixel ảnh không hợp lệ");
        this.maxBytes = maxBytes;
        this.maxPixels = maxPixels;
    }

    public byte[] validate(MultipartFile file) {
        if (file == null || file.isEmpty())
            throw new Tv3Exception(400, "Vui lòng chọn file ảnh không rỗng");
        if (file.getSize() > maxBytes) throw new Tv3Exception(413, "Ảnh vượt dung lượng cho phép");
        try (var input = file.getInputStream()) {
            byte[] bytes = input.readNBytes((int) Math.min(maxBytes + 1, Integer.MAX_VALUE));
            if (bytes.length > maxBytes)
                throw new Tv3Exception(413, "Ảnh vượt dung lượng cho phép");
            try (var stream = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
                var readers = ImageIO.getImageReaders(stream);
                if (!readers.hasNext())
                    throw new Tv3Exception(400, "Nội dung file không phải ảnh được hỗ trợ");
                var reader = readers.next();
                try {
                    var damaged = new java.util.concurrent.atomic.AtomicBoolean(false);
                    reader.addIIOReadWarningListener((source, warning) -> damaged.set(true));
                    if (!Set.of("jpeg", "jpg", "png", "tif", "tiff", "webp")
                            .contains(reader.getFormatName().toLowerCase(java.util.Locale.ROOT)))
                        throw new Tv3Exception(400, "Chỉ hỗ trợ JPEG, PNG, WEBP, TIFF");
                    reader.setInput(stream, true, true);
                    long pixels = (long) reader.getWidth(0) * reader.getHeight(0);
                    if (pixels < 1 || pixels > maxPixels)
                        throw new Tv3Exception(400, "Kích thước ảnh không hợp lệ");
                    if (reader.read(0) == null || damaged.get())
                        throw new Tv3Exception(400, "Ảnh bị lỗi hoặc thiếu dữ liệu");
                } finally {
                    reader.dispose();
                }
            }
            return bytes;
        } catch (IOException | IllegalArgumentException e) {
            throw new Tv3Exception(400, "Không đọc được nội dung ảnh");
        }
    }
}
