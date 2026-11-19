package com.chamas.academy.repository;

import com.chamas.academy.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for {@link AuditLog} entity management.
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}
