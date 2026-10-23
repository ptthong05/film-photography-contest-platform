package com.example.backend.exception;

/** Ném khi đã đăng nhập nhưng thao tác bị cấm (tài khoản bị khóa, tự khóa chính mình...) → HTTP 403. */
public class ForbiddenOperationException extends RuntimeException {

    public ForbiddenOperationException(String message) {
        super(message);
    }
}
