package com.chamas.academy.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtTokenProviderTest {

    private static final String VALID_SECRET_BASE64 = "dGVzdC1zZWNyZXQta2V5LWZvci1jaGFtYXMtYWNhZGVteS1hdXRoZW50aWNhdGlvbi0yNTYtYml0cyE=";
    private static final long EXPIRATION_MS = 3600000; // 1 hour

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", VALID_SECRET_BASE64);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationMs", EXPIRATION_MS);
        jwtTokenProvider.init();
    }

    @Test
    @DisplayName("Generates a valid JWT token with subject and claims")
    void shouldGenerateValidToken() {
        String token = jwtTokenProvider.generateToken(
                101L,
                "test@example.com",
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );

        assertThat(token).isNotBlank();
        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
        assertThat(jwtTokenProvider.getEmailFromToken(token)).isEqualTo("test@example.com");
        assertThat(jwtTokenProvider.getUserIdFromToken(token)).isEqualTo(101L);
    }

    @Test
    @DisplayName("Fails validation when JWT signature is tampered with")
    void shouldRejectTamperedToken() {
        String token = jwtTokenProvider.generateToken(
                101L,
                "test@example.com",
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );

        // Tamper with the signature portion
        String tamperedToken = token.substring(0, token.lastIndexOf('.') + 1) + "invalidsignature";

        assertThat(jwtTokenProvider.validateToken(tamperedToken)).isFalse();
    }

    @Test
    @DisplayName("Fails validation when token is signed with a different secret key")
    void shouldRejectTokenSignedWithDifferentSecret() {
        SecretKey otherKey = Keys.hmacShaKeyFor("different-secret-key-that-is-at-least-256-bits-long!".getBytes(StandardCharsets.UTF_8));
        String forgedToken = Jwts.builder()
                .subject("forged@example.com")
                .claim("userId", 999L)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(otherKey, Jwts.SIG.HS256)
                .compact();

        assertThat(jwtTokenProvider.validateToken(forgedToken)).isFalse();
    }

    @Test
    @DisplayName("Fails validation when JWT token has expired")
    void shouldRejectExpiredToken() {
        SecretKey key = (SecretKey) ReflectionTestUtils.getField(jwtTokenProvider, "secretKey");
        // Create a token that expired 10 minutes ago
        String expiredToken = Jwts.builder()
                .subject("expired@example.com")
                .claim("userId", 102L)
                .issuedAt(new Date(System.currentTimeMillis() - 7200000))
                .expiration(new Date(System.currentTimeMillis() - 600000))
                .signWith(key, Jwts.SIG.HS256)
                .compact();

        assertThat(jwtTokenProvider.validateToken(expiredToken)).isFalse();
    }

    @Test
    @DisplayName("Fails validation for malformed or null tokens")
    void shouldRejectMalformedToken() {
        assertThat(jwtTokenProvider.validateToken("malformed.token")).isFalse();
        assertThat(jwtTokenProvider.validateToken("")).isFalse();
        assertThat(jwtTokenProvider.validateToken(null)).isFalse();
    }

    @Test
    @DisplayName("Throws IllegalStateException at startup when signing secret is missing or too short (< 256 bits)")
    void shouldFailSecurelyWhenSecretIsMissingOrInvalid() {
        JwtTokenProvider missingSecretProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(missingSecretProvider, "jwtSecret", "");
        assertThatThrownBy(missingSecretProvider::init)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not configured");

        JwtTokenProvider shortSecretProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(shortSecretProvider, "jwtSecret", "too-short-secret");
        assertThatThrownBy(shortSecretProvider::init)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("at least 256 bits");
    }
}
