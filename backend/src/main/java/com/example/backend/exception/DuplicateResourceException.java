package com.example.backend.exception;

/** Ném khi tạo/cập nhật gây trùng dữ liệu unique (vd: email) → HTTP 409. */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
