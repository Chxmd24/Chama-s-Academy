package com.chamas.academy.exception;

/**
 * Exception thrown when a user registration attempt uses an email address that is already registered.
 */
public class DuplicateEmailException extends RuntimeException {

    public DuplicateEmailException(String message) {
        super(message);
    }
}
