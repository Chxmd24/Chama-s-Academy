package com.chamas.academy.controller;

import com.chamas.academy.model.AuditLog;
import com.chamas.academy.model.Role;
import com.chamas.academy.model.User;
import com.chamas.academy.repository.AuditLogRepository;
import com.chamas.academy.repository.RoleRepository;
import com.chamas.academy.repository.UserRepository;
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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerIntegrationTest {

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

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        auditLogRepository.deleteAll();

        // Ensure system roles are seeded in H2 test database
        for (String roleName : List.of(Role.ROLE_CUSTOMER, Role.ROLE_ADMIN, Role.ROLE_UMPIRE, Role.ROLE_REFEREE, Role.ROLE_STAFF)) {
            if (!roleRepository.existsByName(roleName)) {
                roleRepository.save(new Role(roleName, "System role " + roleName));
            }
        }
    }

    @Test
    @DisplayName("POST /api/auth/register should successfully register a customer and return 201 Created")
    void shouldRegisterCustomerSuccessfully() throws Exception {
        String requestJson = """
            {
                "firstName": "Saman",
                "lastName": "Perera",
                "email": "saman.perera@example.com",
                "password": "SecurePassword123!",
                "phoneNumber": "0771234567"
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(notNullValue()))
                .andExpect(jsonPath("$.firstName").value("Saman"))
                .andExpect(jsonPath("$.lastName").value("Perera"))
                .andExpect(jsonPath("$.email").value("saman.perera@example.com"))
                .andExpect(jsonPath("$.phoneNumber").value("0771234567"))
                .andExpect(jsonPath("$.roles", contains("ROLE_CUSTOMER")))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.createdAt").value(notNullValue()))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());

        // Verify database persistence and password hashing
        Optional<User> savedUserOpt = userRepository.findByEmail("saman.perera@example.com");
        assertThat(savedUserOpt).isPresent();
        User savedUser = savedUserOpt.get();
        assertThat(savedUser.getPasswordHash()).isNotEqualTo("SecurePassword123!");
        assertThat(passwordEncoder.matches("SecurePassword123!", savedUser.getPasswordHash())).isTrue();
        assertThat(savedUser.getRoles()).extracting(Role::getName).containsExactly("ROLE_CUSTOMER");

        // Verify audit log creation
        List<AuditLog> audits = auditLogRepository.findAll();
        assertThat(audits).isNotEmpty();
        AuditLog audit = audits.getFirst();
        assertThat(audit.getAction()).isEqualTo("CUSTOMER_REGISTERED");
        assertThat(audit.getEntityType()).isEqualTo("USER");
        assertThat(audit.getEntityId()).isEqualTo(savedUser.getId());
        assertThat(audit.getDetails()).contains("saman.perera@example.com");
        assertThat(audit.getDetails()).doesNotContain("SecurePassword123!");
    }

    @Test
    @DisplayName("POST /api/auth/register should normalize email by trimming and converting to lowercase")
    void shouldNormalizeEmailAddress() throws Exception {
        String requestJson = """
            {
                "firstName": "Kamal",
                "lastName": "Silva",
                "email": "   Kamal.Silva@DOMAIN.COM   ",
                "password": "SecurePassword123!",
                "phoneNumber": null
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("kamal.silva@domain.com"));

        assertThat(userRepository.findByEmail("kamal.silva@domain.com")).isPresent();
        assertThat(userRepository.findByEmail("Kamal.Silva@DOMAIN.COM")).isEmpty();
    }

    @Test
    @DisplayName("POST /api/auth/register should reject duplicate email with 409 Conflict")
    void shouldRejectDuplicateEmailWithConflict() throws Exception {
        String firstRegistration = """
            {
                "firstName": "First",
                "lastName": "User",
                "email": "duplicate@example.com",
                "password": "Password123!",
                "phoneNumber": null
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(firstRegistration))
                .andExpect(status().isCreated());

        String duplicateRegistration = """
            {
                "firstName": "Second",
                "lastName": "User",
                "email": "   DUPLICATE@example.com   ",
                "password": "OtherPassword456!",
                "phoneNumber": null
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(duplicateRegistration))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("An account with this email address already exists."));
    }

    @Test
    @DisplayName("POST /api/auth/register should reject invalid email format with 400 Bad Request")
    void shouldRejectInvalidEmailFormat() throws Exception {
        String invalidEmailJson = """
            {
                "firstName": "Invalid",
                "lastName": "Email",
                "email": "not-a-valid-email-address",
                "password": "Password123!",
                "phoneNumber": null
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidEmailJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors.email").exists());
    }

    @Test
    @DisplayName("POST /api/auth/register should reject weak passwords with 400 Bad Request")
    void shouldRejectWeakPasswords() throws Exception {
        // Missing special character
        String noSpecial = """
            {"firstName":"A","lastName":"B","email":"test1@test.com","password":"NoSpecialChar12"}
            """;
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(noSpecial))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.password").exists());

        // Missing digit
        String noDigit = """
            {"firstName":"A","lastName":"B","email":"test2@test.com","password":"NoDigitPassword!"}
            """;
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(noDigit))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.password").exists());

        // Missing uppercase
        String noUpper = """
            {"firstName":"A","lastName":"B","email":"test3@test.com","password":"nouppercase123!"}
            """;
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(noUpper))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.password").exists());

        // Too short (< 8 chars)
        String tooShort = """
            {"firstName":"A","lastName":"B","email":"test4@test.com","password":"Short1!"}
            """;
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(tooShort))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    @Test
    @DisplayName("POST /api/auth/register should reject missing required fields with 400 Bad Request")
    void shouldRejectMissingRequiredFields() throws Exception {
        String emptyJson = """
            {
                "firstName": "",
                "lastName": "",
                "email": "",
                "password": ""
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(emptyJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors.firstName").exists())
                .andExpect(jsonPath("$.fieldErrors.lastName").exists())
                .andExpect(jsonPath("$.fieldErrors.email").exists())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    @Test
    @DisplayName("POST /api/auth/register succeeds when optional phone number is omitted or empty")
    void shouldSucceedWithOptionalPhoneNumber() throws Exception {
        String nullPhone = """
            {
                "firstName": "NoPhone",
                "lastName": "User",
                "email": "nophone@example.com",
                "password": "ValidPassword123!"
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nullPhone))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.phoneNumber").doesNotExist());

        String emptyPhone = """
            {
                "firstName": "EmptyPhone",
                "lastName": "User",
                "email": "emptyphone@example.com",
                "password": "ValidPassword123!",
                "phoneNumber": ""
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(emptyPhone))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.phoneNumber").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/auth/register ignores client role manipulation attempts and strictly assigns ROLE_CUSTOMER")
    void shouldIgnoreRoleEscalationAttempts() throws Exception {
        String maliciousPayload = """
            {
                "firstName": "Hacker",
                "lastName": "Attempt",
                "email": "hacker@example.com",
                "password": "ValidPassword123!",
                "role": "ROLE_ADMIN",
                "roles": ["ROLE_ADMIN", "ROLE_STAFF"]
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(maliciousPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.roles", contains("ROLE_CUSTOMER")));

        User savedUser = userRepository.findByEmail("hacker@example.com").orElseThrow();
        assertThat(savedUser.getRoles())
                .extracting(Role::getName)
                .containsExactly("ROLE_CUSTOMER");
    }

    @Test
    @DisplayName("GET /api/health remains publicly accessible without authentication")
    void shouldAllowPublicAccessToHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/health")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.database").value("CONNECTED"));
    }

    @Test
    @DisplayName("Protected API paths reject unauthenticated access with 401 Unauthorized")
    void shouldRejectUnauthenticatedAccessToProtectedRoutes() throws Exception {
        mockMvc.perform(get("/api/users/profile")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/auth/register should return 500 Internal Server Error with safe message when ROLE_CUSTOMER is missing")
    void shouldReturn500WhenRoleCustomerMissing() throws Exception {
        // Remove ROLE_CUSTOMER from the database
        roleRepository.findByName(Role.ROLE_CUSTOMER).ifPresent(role -> roleRepository.delete(role));

        String requestJson = """
            {
                "firstName": "NoRole",
                "lastName": "Customer",
                "email": "norole@example.com",
                "password": "ValidPassword123!",
                "phoneNumber": null
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.error").value("Internal Server Error"))
                .andExpect(jsonPath("$.message").value("Required system role configuration is missing. Please contact system administration."))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/auth/register ignores spoofed X-Forwarded-For header by default and uses direct remote address")
    void shouldIgnoreSpoofedXForwardedForHeaderByDefault() throws Exception {
        String requestJson = """
            {
                "firstName": "Direct",
                "lastName": "IP",
                "email": "direct.ip@example.com",
                "password": "ValidPassword123!",
                "phoneNumber": null
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-Forwarded-For", "198.51.100.99")
                        .content(requestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("direct.ip@example.com"));

        List<AuditLog> audits = auditLogRepository.findAll();
        assertThat(audits).isNotEmpty();
        AuditLog audit = audits.getLast();
        // Since trusted-proxy-enabled is false by default, the spoofed header is ignored and MockMvc's remoteAddr (127.0.0.1) is recorded
        assertThat(audit.getIpAddress()).isEqualTo("127.0.0.1");
        assertThat(audit.getIpAddress()).isNotEqualTo("198.51.100.99");
    }

    @Test
    @DisplayName("POST /api/auth/register returns 400 Bad Request when JSON payload is malformed")
    void shouldRejectMalformedJsonWith400BadRequest() throws Exception {
        String malformedJson = "{\"firstName\": \"Broken\", \"lastName\": ";

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(malformedJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Malformed JSON request payload or invalid parameter format"));
    }
}
