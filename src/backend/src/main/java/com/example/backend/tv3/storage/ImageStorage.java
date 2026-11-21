package com.example.backend.tv3.storage;

public interface ImageStorage {
    record Asset(String url, String publicId) {}

    Asset upload(byte[] content);

    void delete(String publicId);
}
