package com.chamas.academy.controller;

import com.chamas.academy.dto.LoginRequest;
import com.chamas.academy.dto.LoginResponse;
import com.chamas.academy.dto.RegistrationRequest;
import com.chamas.academy.dto.RegistrationResponse;
import com.chamas.academy.dto.UserProfileResponse;
import com.chamas.academy.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

/**
 * REST controller for authentication and user account lifecycle endpoints.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final boolean trustedProxyEnabled;

    public AuthController(AuthService authService,
                          @Value("${chamas.security.trusted-proxy-enabled:false}") boolean trustedProxyEnabled) {
        this.authService = authService;
        this.trustedProxyEnabled = trustedProxyEnabled;
    }

    /**
     * Public endpoint for customer account registration.
     * Always assigns the default ROLE_CUSTOMER security role.
     *
     * @param request     validated customer registration payload
     * @param httpRequest HTTP servlet request for client IP resolution
     * @return 201 Created with safe registration response
     */
    @PostMapping("/register")
    public ResponseEntity<RegistrationResponse> register(
            @Valid @RequestBody RegistrationRequest request,
            HttpServletRequest httpRequest) {
        String clientIp = extractClientIp(httpRequest);
        RegistrationResponse response = authService.registerCustomer(request, clientIp);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Public endpoint for user authentication and JWT access token issuance.
     *
     * @param request     validated login credentials
     * @param httpRequest HTTP servlet request for client IP resolution
     * @return 200 OK with access token and user profile
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        String clientIp = extractClientIp(httpRequest);
        LoginResponse response = authService.login(request, clientIp);
        return ResponseEntity.ok(response);
    }

    /**
     * Authenticated endpoint returning the current user's profile and assigned roles.
     *
     * @param principal authenticated principal from SecurityContext
     * @return 200 OK with safe user profile DTO
     */
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserProfileResponse response = authService.getCurrentUser(principal.getName());
        return ResponseEntity.ok(response);
    }

    /**
     * Resolves the authoritative client IP address.
     * Direct socket remote address is used by default to prevent header spoofing.
     *
     * @param request the HTTP servlet request
     * @return authoritative client IP address
     */
    private String extractClientIp(HttpServletRequest request) {
        if (trustedProxyEnabled) {
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isBlank()) {
                return xForwardedFor.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }
}
