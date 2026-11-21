package com.example.backend.tv3.web;

public class Tv3Exception extends RuntimeException {
    private final int status;

    public Tv3Exception(int status, String message) {
        super(message);
        this.status = status;
    }

    public int status() {
        return status;
    }
}
