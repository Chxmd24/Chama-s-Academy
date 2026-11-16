package com.chamas.academy.controller;

import com.chamas.academy.dto.HealthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Health check REST controller for verifying backend service availability.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    /**
     * Public health check endpoint.
     *
     * @return HTTP 200 with current backend status details
     */
    @GetMapping("/health")
    public ResponseEntity<HealthResponse> getHealth() {
        return ResponseEntity.ok(new HealthResponse(
            "UP",
            "Chama's Academy Backend",
            "Backend is running successfully"
        ));
    }
}
