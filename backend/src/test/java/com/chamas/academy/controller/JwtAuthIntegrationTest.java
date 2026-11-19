package com.chamas.academy.controller;

import com.chamas.academy.model.AuditLog;
import com.chamas.academy.model.Role;
import com.chamas.academy.model.User;
import com.chamas.academy.repository.AuditLogRepository;
import com.chamas.academy.repository.RoleRepository;
import com.chamas.academy.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class JwtAuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Role customerRole;
    private Role adminRole;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        auditLogRepository.deleteAll();

        customerRole = roleRepository.findByName(Role.ROLE_CUSTOMER)
                .orElseGet(() -> roleRepository.save(new Role(Role.ROLE_CUSTOMER, "Customer role")));
        adminRole = roleRepository.findByName(Role.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(Role.ROLE_ADMIN, "Admin role")));
    }

    @Test
    @DisplayName("POST /api/auth/login should authenticate user, return JWT access token, and record audit log")
    void shouldLoginSuccessfullyWithValidCredentials() throws Exception {
        // Create user
        User user = new User("customer@example.com", passwordEncoder.encode("ValidPassword123!"), "John", "Doe", "0771234567");
        user.setStatus(User.STATUS_ACTIVE);
        user.setRoles(Set.of(customerRole));
        userRepository.saveAndFlush(user);

        String loginJson = """
            {
                "email": "  Customer@Example.com  ",
                "password": "ValidPassword123!"
            }
            """;

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value(notNullValue()))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(86400))
                .andExpect(jsonPath("$.user.email").value("customer@example.com"))
                .andExpect(jsonPath("$.user.firstName").value("John"))
                .andExpect(jsonPath("$.user.lastName").value("Doe"))
                .andExpect(jsonPath("$.roles", contains("ROLE_CUSTOMER")))
                .andExpect(jsonPath("$.user.password").doesNotExist())
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist())
                .andReturn();

        // Verify audit log
        List<AuditLog> audits = auditLogRepository.findAll();
        assertThat(audits).isNotEmpty();
        AuditLog audit = audits.getLast();
        assertThat(audit.getAction()).isEqualTo("LOGIN_SUCCESS");
        assertThat(audit.getDetails()).contains("customer@example.com");
        assertThat(audit.getDetails()).doesNotContain("ValidPassword123!");
    }

    @Test
    @DisplayName("POST /api/auth/login should reject incorrect password with 401 Unauthorized without account enumeration")
    void shouldRejectLoginWithIncorrectPassword() throws Exception {
        User user = new User("customer@example.com", passwordEncoder.encode("ValidPassword123!"), "John", "Doe", null);
        user.setStatus(User.STATUS_ACTIVE);
        user.setRoles(Set.of(customerRole));
        userRepository.saveAndFlush(user);

        String loginJson = """
            {
                "email": "customer@example.com",
                "password": "WrongPassword123!"
            }
            """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Invalid email or password."));

        List<AuditLog> audits = auditLogRepository.findAll();
        assertThat(audits).isNotEmpty();
        AuditLog audit = audits.getLast();
        assertThat(audit.getAction()).isEqualTo("LOGIN_FAILURE");
        assertThat(audit.getDetails()).doesNotContain("WrongPassword123!");
    }

    @Test
    @DisplayName("POST /api/auth/login should reject non-existent email with generic 401 Unauthorized")
    void shouldRejectLoginWithNonExistentEmail() throws Exception {
        String loginJson = """
            {
                "email": "nonexistent@example.com",
                "password": "AnyPassword123!"
            }
            """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid email or password."));
    }

    @Test
    @DisplayName("POST /api/auth/login should reject login for suspended or inactive accounts with 403 Forbidden")
    void shouldRejectLoginWhenAccountIsSuspended() throws Exception {
        User user = new User("suspended@example.com", passwordEncoder.encode("ValidPassword123!"), "Suspended", "User", null);
        user.setStatus(User.STATUS_SUSPENDED);
        user.setRoles(Set.of(customerRole));
        userRepository.saveAndFlush(user);

        String loginJson = """
            {
                "email": "suspended@example.com",
                "password": "ValidPassword123!"
            }
            """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("Account is inactive or suspended."));
    }

    @Test
    @DisplayName("GET /api/auth/me should return current user profile with valid JWT Bearer token")
    void shouldGetCurrentUserProfileWithValidJwt() throws Exception {
        String token = obtainJwtToken("me@example.com", "ValidPassword123!", "Alice", "Smith", Set.of(customerRole));

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("me@example.com"))
                .andExpect(jsonPath("$.firstName").value("Alice"))
                .andExpect(jsonPath("$.lastName").value("Smith"))
                .andExpect(jsonPath("$.roles", contains("ROLE_CUSTOMER")))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("GET /api/auth/me should reject unauthenticated requests with 401 Unauthorized")
    void shouldRejectGetCurrentUserWithoutJwt() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Full authentication is required to access this resource."));
    }

    @Test
    @DisplayName("GET /api/auth/me should reject requests with tampered JWT token with 401 Unauthorized")
    void shouldRejectGetCurrentUserWithTamperedJwt() throws Exception {
        String token = obtainJwtToken("me@example.com", "ValidPassword123!", "Alice", "Smith", Set.of(customerRole));
        String tamperedToken = token.substring(0, token.lastIndexOf('.') + 1) + "invalidsignature";

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + tamperedToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("GET /api/auth/me should reject requests with malformed Authorization header with 401 Unauthorized")
    void shouldRejectGetCurrentUserWithMalformedAuthorizationHeader() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Basic dXNlcjpwYXNz")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("ROLE_CUSTOMER should be blocked from administrative routes with 403 Forbidden")
    void shouldBlockCustomerRoleFromAdminEndpointsWith403() throws Exception {
        String customerToken = obtainJwtToken("customer@example.com", "ValidPassword123!", "Cust", "Omer", Set.of(customerRole));

        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + customerToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"))
                .andExpect(jsonPath("$.message").value("Access denied: insufficient permissions to access this resource."));
    }

    @Test
    @DisplayName("ROLE_ADMIN should be granted access to administrative routes with 200 OK")
    void shouldAllowAdminRoleToAccessAdminEndpoints() throws Exception {
        String adminToken = obtainJwtToken("admin@example.com", "AdminPassword123!", "Admin", "User", Set.of(adminRole));

        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + adminToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.role").value("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("Security context derives authorities from current database roles rather than trusting token claims")
    void shouldReflectDatabaseRoleChangesImmediatelyWithoutReissuingToken() throws Exception {
        // Issue token to customer
        User user = new User("dynamic@example.com", passwordEncoder.encode("ValidPassword123!"), "Dynamic", "User", null);
        user.setStatus(User.STATUS_ACTIVE);
        user.setRoles(new HashSet<>(Set.of(customerRole)));
        userRepository.saveAndFlush(user);

        String loginJson = """
            {"email": "dynamic@example.com", "password": "ValidPassword123!"}
            """;
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("accessToken").asText();

        // 1. Initially as customer, access to admin route is 403 Forbidden
        mockMvc.perform(get("/api/admin/dashboard").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());

        // 2. In database, promote user to ADMIN
        user.addRole(adminRole);
        userRepository.saveAndFlush(user);

        // 3. Using the SAME token, admin route is now accessible with 200 OK!
        mockMvc.perform(get("/api/admin/dashboard").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));

        // 4. In database, suspend user account
        user.setStatus(User.STATUS_SUSPENDED);
        userRepository.saveAndFlush(user);

        // 5. Using the SAME token, access is now completely blocked with 401 Unauthorized!
        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Rejects forged JWT token with forged ADMIN role claim signed with untrusted secret")
    void shouldRejectForgedTokenWithAdminRoleClaimSignedWithUntrustedSecret() throws Exception {
        SecretKey untrustedKey = Keys.hmacShaKeyFor("untrusted-attacker-secret-key-that-is-at-least-256-bits!".getBytes(StandardCharsets.UTF_8));
        String forgedToken = Jwts.builder()
                .subject("attacker@example.com")
                .claim("userId", 999L)
                .claim("roles", List.of("ROLE_ADMIN"))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(untrustedKey, Jwts.SIG.HS256)
                .compact();

        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + forgedToken))
                .andExpect(status().isUnauthorized());
    }

    private String obtainJwtToken(String email, String rawPassword, String firstName, String lastName, Set<Role> roles) throws Exception {
        User user = new User(email, passwordEncoder.encode(rawPassword), firstName, lastName, null);
        user.setStatus(User.STATUS_ACTIVE);
        user.setRoles(roles);
        userRepository.saveAndFlush(user);

        String loginJson = String.format("{\"email\": \"%s\", \"password\": \"%s\"}", email, rawPassword);
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        return root.get("accessToken").asText();
    }
}
