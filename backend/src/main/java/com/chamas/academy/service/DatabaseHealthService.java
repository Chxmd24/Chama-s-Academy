package com.chamas.academy.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * Service for verifying database connectivity through the configured DataSource.
 * Provides safe status reporting without exposing credentials or internal connection details.
 */
@Service
public class DatabaseHealthService {

    private static final Logger log = LoggerFactory.getLogger(DatabaseHealthService.class);

    private final ObjectProvider<DataSource> dataSourceProvider;

    public DatabaseHealthService(ObjectProvider<DataSource> dataSourceProvider) {
        this.dataSourceProvider = dataSourceProvider;
    }

    /**
     * Checks database connectivity.
     *
     * @return "CONNECTED" if active connection can be established,
     *         "DISCONNECTED" if connection fails,
     *         "NOT_CONFIGURED" if no DataSource is configured in the current profile.
     */
    public String checkDatabaseStatus() {
        DataSource dataSource = dataSourceProvider.getIfAvailable();
        if (dataSource == null) {
            return "NOT_CONFIGURED";
        }

        try (Connection connection = dataSource.getConnection()) {
            if (connection != null && (connection.isValid(2) || !connection.isClosed())) {
                return "CONNECTED";
            }
            return "DISCONNECTED";
        } catch (SQLException e) {
            log.warn("Database connectivity verification reported SQLException: {}", e.getMessage());
            return "DISCONNECTED";
        } catch (Exception e) {
            log.warn("Database connectivity verification failed: {}", e.getMessage());
            return "DISCONNECTED";
        }
    }
}
