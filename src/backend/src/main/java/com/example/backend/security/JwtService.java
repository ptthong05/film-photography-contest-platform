package com.example.backend.security;

import com.example.backend.entity.User;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

/** Tạo và kiểm tra JWT. Token chỉ chứa userId + role; quyền thật luôn đọc lại từ DB ở filter. */
@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final int MIN_SECRET_BYTES = 32;

    private final SecretKey signingKey;
    private final Duration expiration;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
        this.signingKey = buildSigningKey(secret);
        this.expiration = Duration.ofMinutes(expirationMinutes);
    }

    public IssuedToken generateToken(User user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(expiration);
        String token = Jwts.builder()
                .subject(user.getId())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(signingKey)
                .compact();
        return new IssuedToken(token, expiresAt);
    }

    /** Trả userId nếu token hợp lệ và chưa hết hạn, ngược lại Optional.empty(). */
    public Optional<String> extractUserId(String token) {
        try {
            return Optional.ofNullable(Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject());
        } catch (JwtException | IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    private static SecretKey buildSigningKey(String secret) {
        if (secret == null || secret.isBlank()) {
            // Tiện cho dev: không cần cấu hình gì vẫn chạy được, đổi lại token mất hiệu lực mỗi lần restart
            log.warn("JWT_SECRET chưa được đặt, dùng khóa ngẫu nhiên. Mọi token sẽ mất hiệu lực khi khởi động lại.");
            return Jwts.SIG.HS256.key().build();
        }
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < MIN_SECRET_BYTES) {
            throw new IllegalStateException("JWT_SECRET phải dài tối thiểu " + MIN_SECRET_BYTES + " ký tự");
        }
        return Keys.hmacShaKeyFor(bytes);
    }
}
