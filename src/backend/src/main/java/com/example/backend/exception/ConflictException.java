package com.example.backend.exception;

/** Ném khi thao tác xung đột với trạng thái hiện tại của dữ liệu (vd: sửa phiếu chấm đã chốt) → HTTP 409. */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
