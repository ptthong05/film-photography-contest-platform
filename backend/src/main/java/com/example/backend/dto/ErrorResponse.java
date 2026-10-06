package com.example.backend.dto;

/** Định dạng lỗi thống nhất trả về cho client: { "message": "..." } */
public record ErrorResponse(String message) {
}
