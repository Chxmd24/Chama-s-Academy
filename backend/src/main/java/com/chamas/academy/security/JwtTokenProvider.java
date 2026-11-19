package com.chamas.academy.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for cryptographic generation, parsing, and signature validation of JWT access tokens.
 * Utilizes JJWT 0.12.6 with HMAC-SHA256 (HS256).
 */
@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);
    private static final int MINIMUM_SECRET_BYTES = 32; // 256 bits

    @Value("${chamas.jwt.secret:}")
    private String jwtSecret;

    @Value("${chamas.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException(
                    "JWT signing secret key is not configured. " +
                    "Set the CHAMAS_JWT_SECRET environment variable or configure 'chamas.jwt.secret'."
            );
        }

        byte[] keyBytes;
        try {
            // Attempt Base64 decode first
            keyBytes = Decoders.BASE64.decode(jwtSecret.trim());
        } catch (Exception e) {
            // Fall back to raw UTF-8 bytes if not standard Base64
            keyBytes = jwtSecret.trim().getBytes(StandardCharsets.UTF_8);
        }

        if (keyBytes.length < MINIMUM_SECRET_BYTES) {
            throw new IllegalStateException(
                    "JWT signing secret key must be at least 256 bits (" + MINIMUM_SECRET_BYTES + " bytes). " +
                    "Current key size is " + (keyBytes.length * 8) + " bits (" + keyBytes.length + " bytes)."
            );
        }

        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        log.info("JwtTokenProvider initialized successfully with HS256 algorithm (expiration: {} ms)", jwtExpirationMs);
    }

    /**
     * Generates a signed JWT access token.
     *
     * @param userId      the user ID
     * @param email       the user normalized email
     * @param authorities user granted authorities
     * @return compact URL-safe JWT string
     */
    public String generateToken(Long userId, String email, Collection<? extends GrantedAuthority> authorities) {
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);
        Date expiryDate = new Date(nowMillis + jwtExpirationMs);

        List<String> roles = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Validates a JWT token's cryptographic signature, expiration, and structural integrity.
     *
     * @param token JWT string
     * @return true if valid and unexpired, false otherwise
     */
    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Extracts normalized subject (email) from a valid JWT.
     *
     * @param token JWT string
     * @return email subject
     */
    public String getEmailFromToken(String token) {
        Claims claims = extractAllClaims(token);
        return claims.getSubject();
    }

    /**
     * Extracts user ID from JWT claims.
     *
     * @param token JWT string
     * @return user ID
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = extractAllClaims(token);
        Object userIdObj = claims.get("userId");
        if (userIdObj instanceof Number number) {
            return number.longValue();
        }
        return null;
    }

    public long getExpirationSeconds() {
        return jwtExpirationMs / 1000;
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
