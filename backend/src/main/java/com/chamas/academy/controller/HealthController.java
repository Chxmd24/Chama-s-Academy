package com.chamas.academy.controller;

import com.chamas.academy.dto.HealthResponse;
import com.chamas.academy.service.DatabaseHealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Health check REST controller for verifying backend service availability
 * and safe database connectivity status.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    private final DatabaseHealthService databaseHealthService;

    public HealthController(DatabaseHealthService databaseHealthService) {
        this.databaseHealthService = databaseHealthService;
    }

    /**
     * Public health check endpoint.
     *
     * @return HTTP 200 with current backend status and database infrastructure details
     */
    @GetMapping("/health")
    public ResponseEntity<HealthResponse> getHealth() {
        String dbStatus = databaseHealthService.checkDatabaseStatus();
        return ResponseEntity.ok(new HealthResponse(
            "UP",
            "Chama's Academy Backend",
            "Backend is running successfully",
            dbStatus
        ));
    }
}
