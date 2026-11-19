package com.chamas.academy;

import com.chamas.academy.repository.AuditLogRepository;
import com.chamas.academy.repository.RoleRepository;
import com.chamas.academy.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import javax.sql.DataSource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Explicitly opt-in integration test that validates Hibernate schema validation
 * (ddl-auto: validate) against the actual live MySQL development database.
 *
 * Safety & Isolation Principles:
 * 1. Excluded from default 'mvn clean test' runs by requiring the explicit system property
 *    -Dverify.mysql=true so that local tests do not fail when MySQL is stopped.
 * 2. Strictly read-only: No records are inserted, modified, or deleted.
 *
 * Execution Command:
 *   mvn test -Dverify.mysql=true -Dtest=MySqlSchemaValidationTest -f backend/pom.xml
 */
@Tag("live-mysql")
@EnabledIfSystemProperty(named = "verify.mysql", matches = "true")
@SpringBootTest
@ActiveProfiles("mysql")
class MySqlSchemaValidationTest {

    @Autowired(required = false)
    private UserRepository userRepository;

    @Autowired(required = false)
    private RoleRepository roleRepository;

    @Autowired(required = false)
    private AuditLogRepository auditLogRepository;

    @Autowired(required = false)
    private DataSource dataSource;

    @Test
    @DisplayName("Hibernate validates all JPA entities against live MySQL schema with ddl-auto=validate")
    void shouldValidateJpaEntitiesAgainstLiveMySqlSchema() {
        assertThat(dataSource).isNotNull();
        assertThat(userRepository).isNotNull();
        assertThat(roleRepository).isNotNull();
        assertThat(auditLogRepository).isNotNull();

        // Read-only verification: exactly 5 seeded roles, 0 users, 0 audit logs
        assertThat(roleRepository.count()).isEqualTo(5);
        assertThat(userRepository.count()).isEqualTo(0);
        assertThat(auditLogRepository.count()).isEqualTo(0);
    }
}
