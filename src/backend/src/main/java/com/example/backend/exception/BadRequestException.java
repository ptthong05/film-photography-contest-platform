package com.example.backend.exception;

/** Ném khi dữ liệu hợp lệ về định dạng nhưng sai nghiệp vụ → HTTP 400. */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
