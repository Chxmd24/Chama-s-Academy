package com.chamas.academy.repository;

import com.chamas.academy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link User} entity management.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by normalized email address.
     *
     * @param email normalized email address
     * @return Optional containing the User if found, or empty Optional
     */
    Optional<User> findByEmail(String email);

    /**
     * Checks if a user already exists with the given email address.
     *
     * @param email normalized email address
     * @return true if user exists, false otherwise
     */
    boolean existsByEmail(String email);
}
