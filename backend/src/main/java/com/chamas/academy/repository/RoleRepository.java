package com.chamas.academy.repository;

import com.chamas.academy.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Role} entity management.
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    /**
     * Finds a role by its unique system role name (e.g. ROLE_CUSTOMER, ROLE_ADMIN).
     *
     * @param name system role name
     * @return Optional containing the Role if found, or empty Optional
     */
    Optional<Role> findByName(String name);

    /**
     * Checks if a role exists with the given name.
     *
     * @param name system role name
     * @return true if role exists, false otherwise
     */
    boolean existsByName(String name);
}
