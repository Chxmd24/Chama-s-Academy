package com.chamas.academy.dto;

/**
 * Health check status response record.
 *
 * @param status      Current operational status (e.g. "UP")
 * @param application Application name
 * @param message     Informational status message
 * @param database    Database connectivity status ("CONNECTED", "DISCONNECTED", or "NOT_CONFIGURED")
 */
public record HealthResponse(
    String status,
    String application,
    String message,
    String database
) {
    /**
     * Backward-compatible constructor defaulting database status to NOT_CONFIGURED.
     */
    public HealthResponse(String status, String application, String message) {
        this(status, application, message, "NOT_CONFIGURED");
    }
}
