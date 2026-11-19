package com.chamas.academy.service;

import com.chamas.academy.dto.LoginRequest;
import com.chamas.academy.dto.LoginResponse;
import com.chamas.academy.dto.RegistrationRequest;
import com.chamas.academy.dto.RegistrationResponse;
import com.chamas.academy.dto.UserProfileResponse;
import com.chamas.academy.exception.DuplicateEmailException;
import com.chamas.academy.exception.RoleNotFoundException;
import com.chamas.academy.model.AuditLog;
import com.chamas.academy.model.Role;
import com.chamas.academy.model.User;
import com.chamas.academy.repository.AuditLogRepository;
import com.chamas.academy.repository.RoleRepository;
import com.chamas.academy.repository.UserRepository;
import com.chamas.academy.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service orchestrating customer registration, user authentication (login),
 * role assignment, password encoding, JWT issuance, and security audit logging.
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final ObjectProvider<UserRepository> userRepositoryProvider;
    private final ObjectProvider<RoleRepository> roleRepositoryProvider;
    private final ObjectProvider<AuditLogRepository> auditLogRepositoryProvider;
    private final ObjectProvider<AuthenticationManager> authenticationManagerProvider;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(ObjectProvider<UserRepository> userRepositoryProvider,
                       ObjectProvider<RoleRepository> roleRepositoryProvider,
                       ObjectProvider<AuditLogRepository> auditLogRepositoryProvider,
                       ObjectProvider<AuthenticationManager> authenticationManagerProvider,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepositoryProvider = userRepositoryProvider;
        this.roleRepositoryProvider = roleRepositoryProvider;
        this.auditLogRepositoryProvider = auditLogRepositoryProvider;
        this.authenticationManagerProvider = authenticationManagerProvider;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    private UserRepository getUserRepository() {
        UserRepository repo = userRepositoryProvider.getIfAvailable();
        if (repo == null) {
            throw new IllegalStateException("UserRepository is not configured in the active profile.");
        }
        return repo;
    }

    private RoleRepository getRoleRepository() {
        RoleRepository repo = roleRepositoryProvider.getIfAvailable();
        if (repo == null) {
            throw new IllegalStateException("RoleRepository is not configured in the active profile.");
        }
        return repo;
    }

    private AuditLogRepository getAuditLogRepository() {
        return auditLogRepositoryProvider.getIfAvailable();
    }

    private AuthenticationManager getAuthenticationManager() {
        AuthenticationManager manager = authenticationManagerProvider.getIfAvailable();
        if (manager == null) {
            throw new IllegalStateException("AuthenticationManager is not configured in the active profile.");
        }
        return manager;
    }

    /**
     * Registers a new customer with the default ROLE_CUSTOMER assignment.
     * Enforces email normalization, uniqueness, password hashing, and audit trails.
     *
     * @param request  validated registration request
     * @param clientIp client IP address for audit logging
     * @return safe registration response excluding credentials
     */
    @Transactional
    public RegistrationResponse registerCustomer(RegistrationRequest request, String clientIp) {
        UserRepository userRepository = getUserRepository();
        RoleRepository roleRepository = getRoleRepository();

        // 1. Normalize email address
        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);

        // 2. Pre-check email uniqueness
        if (userRepository.existsByEmail(normalizedEmail)) {
            log.warn("Registration rejected: email {} already registered", normalizedEmail);
            throw new DuplicateEmailException("An account with this email address already exists.");
        }

        // 3. Resolve default customer role
        Role customerRole = roleRepository.findByName(Role.ROLE_CUSTOMER)
                .orElseThrow(() -> new RoleNotFoundException("Default role '" + Role.ROLE_CUSTOMER + "' is not configured in the system."));

        // 4. Securely hash password with BCrypt
        String passwordHash = passwordEncoder.encode(request.getPassword());

        // 5. Construct User entity
        String trimmedPhone = (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty())
                ? request.getPhoneNumber().trim()
                : null;

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordHash);
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPhoneNumber(trimmedPhone);
        user.setStatus(User.STATUS_ACTIVE);
        user.setEmailVerified(false);
        user.setRoles(Set.of(customerRole));

        // 6. Persist user, handling concurrent uniqueness race conditions
        User savedUser;
        try {
            savedUser = userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException ex) {
            log.warn("Concurrent duplicate registration race detected for email: {}", normalizedEmail);
            throw new DuplicateEmailException("An account with this email address already exists.");
        }

        log.info("Customer account registered successfully with ID: {} and email: {}", savedUser.getId(), savedUser.getEmail());

        // 7. Transactional audit log creation
        recordRegistrationAudit(savedUser, customerRole.getName(), clientIp);

        // 8. Map to safe response DTO
        Set<String> roleNames = savedUser.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return new RegistrationResponse(
                savedUser.getId(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                savedUser.getEmail(),
                savedUser.getPhoneNumber(),
                roleNames,
                savedUser.getStatus(),
                savedUser.getCreatedAt()
        );
    }

    /**
     * Authenticates a user by email and password, issuing a signed JWT access token upon success.
     * Rejects inactive accounts and genericizes authentication errors to prevent account enumeration.
     * Failed-login audit records are committed independently so they persist even when authentication fails.
     *
     * @param request  validated login request
     * @param clientIp client IP address for audit logging
     * @return login response containing JWT access token and user summary
     */
    public LoginResponse login(LoginRequest request, String clientIp) {
        UserRepository userRepository = getUserRepository();
        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);

        Authentication authentication;
        try {
            authentication = getAuthenticationManager().authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
            );
        } catch (BadCredentialsException | UsernameNotFoundException ex) {
            log.warn("Authentication failed for email: {} (invalid credentials)", normalizedEmail);
            recordLoginAudit(null, normalizedEmail, false, "INVALID_CREDENTIALS", clientIp);
            throw new BadCredentialsException("Invalid email or password.");
        } catch (DisabledException | LockedException ex) {
            log.warn("Authentication rejected for email: {} (account inactive or disabled)", normalizedEmail);
            recordLoginAudit(null, normalizedEmail, false, "ACCOUNT_INACTIVE", clientIp);
            throw new DisabledException("Account is inactive or suspended.");
        } catch (AuthenticationException ex) {
            log.warn("Authentication error for email: {}: {}", normalizedEmail, ex.getMessage());
            recordLoginAudit(null, normalizedEmail, false, "AUTHENTICATION_FAILED", clientIp);
            throw new BadCredentialsException("Invalid email or password.");
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));

        if (!User.STATUS_ACTIVE.equalsIgnoreCase(user.getStatus())) {
            log.warn("Login blocked for user ID {}: status is {}", user.getId(), user.getStatus());
            recordLoginAudit(user.getId(), normalizedEmail, false, "ACCOUNT_INACTIVE", clientIp);
            throw new DisabledException("Account is inactive or suspended.");
        }

        // Issue JWT token
        String accessToken = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), authentication.getAuthorities());
        long expiresIn = jwtTokenProvider.getExpirationSeconds();

        // Audit successful login
        recordLoginAudit(user.getId(), user.getEmail(), true, "SUCCESS", clientIp);
        log.info("User ID {} authenticated successfully", user.getId());

        Set<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        UserProfileResponse userProfile = new UserProfileResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhoneNumber(),
                roleNames,
                user.getStatus(),
                user.getCreatedAt()
        );

        return new LoginResponse(accessToken, expiresIn, userProfile, roleNames);
    }

    /**
     * Resolves the profile of the currently authenticated user.
     *
     * @param email normalized email address from SecurityContext
     * @return safe user profile DTO
     */
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUser(String email) {
        UserRepository userRepository = getUserRepository();
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        Set<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return new UserProfileResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhoneNumber(),
                roleNames,
                user.getStatus(),
                user.getCreatedAt()
        );
    }

    private void recordRegistrationAudit(User user, String roleName, String clientIp) {
        AuditLogRepository auditRepo = getAuditLogRepository();
        if (auditRepo == null) {
            return;
        }

        String detailsJson = String.format("{\"email\":\"%s\",\"role\":\"%s\"}", user.getEmail(), roleName);
        AuditLog auditLog = new AuditLog(
                user.getId(),
                "CUSTOMER_REGISTERED",
                "USER",
                user.getId(),
                detailsJson,
                clientIp
        );
        auditRepo.save(auditLog);
    }

    private void recordLoginAudit(Long userId, String email, boolean success, String reason, String clientIp) {
        AuditLogRepository auditRepo = getAuditLogRepository();
        if (auditRepo == null) {
            return;
        }

        try {
            String detailsJson = String.format(
                    "{\"email\":\"%s\",\"status\":\"%s\",\"reason\":\"%s\"}",
                    email,
                    success ? "SUCCESS" : "FAILED",
                    reason
            );
            AuditLog auditLog = new AuditLog(
                    userId,
                    success ? "LOGIN_SUCCESS" : "LOGIN_FAILURE",
                    "USER",
                    userId != null ? userId : 0L,
                    detailsJson,
                    clientIp
            );
            auditRepo.saveAndFlush(auditLog);
        } catch (Exception ex) {
            log.error("Failed to record login audit log for email {}: {}", email, ex.getMessage());
        }
    }
}
