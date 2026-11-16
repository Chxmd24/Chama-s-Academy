package com.chamas.academy.dto;

/**
 * Health check status response record.
 *
 * @param status      Current operational status (e.g. "UP")
 * @param application Application name
 * @param message     Informational status message
 */
public record HealthResponse(
    String status,
    String application,
    String message
) {}
