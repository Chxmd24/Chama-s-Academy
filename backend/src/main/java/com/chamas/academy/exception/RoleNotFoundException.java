package com.chamas.academy.exception;

/**
 * Exception thrown when a required system role (e.g. ROLE_CUSTOMER) cannot be found in the database.
 */
public class RoleNotFoundException extends RuntimeException {

    public RoleNotFoundException(String message) {
        super(message);
    }
}
