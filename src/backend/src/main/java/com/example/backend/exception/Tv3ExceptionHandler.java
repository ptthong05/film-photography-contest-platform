package com.example.backend.exception;

import com.example.backend.dto.ErrorResponse;

import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.dao.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice(basePackages = "com.example.backend.tv3.web")
@Order(-10)
@Profile("tv3")
public class Tv3ExceptionHandler {
    @ExceptionHandler(Tv3Exception.class)
    public ResponseEntity<ErrorResponse> business(Tv3Exception e) {
        return response(e.status(), e.getMessage());
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ErrorResponse> validation(BindException e) {
        String message =
                e.getBindingResult().getFieldErrors().stream()
                        .map(f -> f.getField() + ": " + f.getDefaultMessage())
                        .collect(java.util.stream.Collectors.joining("; "));
        return response(400, message);
    }

    @ExceptionHandler({DataIntegrityViolationException.class, ConcurrencyFailureException.class})
    public ResponseEntity<ErrorResponse> conflict(Exception e) {
        return response(409, "Dữ liệu trùng, đang được sử dụng hoặc có thay đổi đồng thời");
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> size(Exception e) {
        return response(413, "Ảnh vượt dung lượng cho phép");
    }

    @ExceptionHandler({
        MissingServletRequestParameterException.class,
        MethodArgumentTypeMismatchException.class,
        HttpMessageNotReadableException.class,
        org.springframework.web.multipart.support.MissingServletRequestPartException.class
    })
    public ResponseEntity<ErrorResponse> invalid(Exception e) {
        return response(400, "Dữ liệu hoặc file gửi lên không hợp lệ");
    }

    private ResponseEntity<ErrorResponse> response(int status, String message) {
        return ResponseEntity.status(status).body(new ErrorResponse(message));
    }
}
