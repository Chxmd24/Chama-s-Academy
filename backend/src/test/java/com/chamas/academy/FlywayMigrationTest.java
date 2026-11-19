package com.chamas.academy;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.output.MigrateResult;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class FlywayMigrationTest {

    @Test
    @DisplayName("Flyway V1 and V2 migrations should execute successfully on MySQL-compatible isolated database")
    void shouldSuccessfullyApplyFlywayMigrations() throws Exception {
        String jdbcUrl = "jdbc:h2:mem:flyway_test_db;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1";

        Flyway flyway = Flyway.configure()
                .dataSource(jdbcUrl, "sa", "")
                .locations("classpath:db/migration")
                .cleanDisabled(false)
                .load();

        MigrateResult result = flyway.migrate();

        assertThat(result.success).isTrue();
        assertThat(result.migrationsExecuted).isEqualTo(2);

        // Verify tables were created in the schema
        try (Connection conn = DriverManager.getConnection(jdbcUrl, "sa", "");
             Statement stmt = conn.createStatement()) {

            Set<String> tables = new HashSet<>();
            try (ResultSet rs = stmt.executeQuery("SHOW TABLES")) {
                while (rs.next()) {
                    tables.add(rs.getString(1).toLowerCase());
                }
            }

            assertThat(tables).contains("users", "roles", "user_roles", "audit_logs", "flyway_schema_history");

            // Verify seeded roles exist
            try (ResultSet rs = stmt.executeQuery("SELECT name FROM roles")) {
                Set<String> roles = new HashSet<>();
                while (rs.next()) {
                    roles.add(rs.getString(1));
                }
                assertThat(roles).contains("ROLE_CUSTOMER", "ROLE_ADMIN", "ROLE_UMPIRE", "ROLE_REFEREE", "ROLE_STAFF");
            }
        }
    }
}
