package com.example.backend.exception;

/** Ném khi sai email/SĐT hoặc mật khẩu → HTTP 401. */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
