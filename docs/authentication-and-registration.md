# Chama's Academy - Authentication Foundation & Customer Registration

## 1. Overview & Architecture

This document specifies the backend authentication foundation, customer registration subsystem, and security policies for Chama's Academy (Indoor Cricket & Football Stadium Management System).

The authentication layer follows an enterprise-grade stateless architecture designed to integrate with the React 18 + Vite frontend and the MySQL 8.0 RBAC schema:

```
[ Frontend (React 18 / Vite) ]
             |
             v  HTTP POST /api/auth/register (JSON)
[ Spring Security Filter Chain ]
             |  (CORS verified, CSRF disabled for stateless REST, permitAll)
             v
[ AuthController ]
             |  (Validates @Valid RegistrationRequest, resolves authoritative client IP)
             v
[ AuthService ]
             |-- 1. Normalizes email (trim + lowercase)
             |-- 2. Validates uniqueness (pre-check + DB race handling)
             |-- 3. Fetches ROLE_CUSTOMER entity from RoleRepository
             |-- 4. Hashes password using BCrypt (work factor 12)
             |-- 5. Maps to User entity with ACTIVE status
             |-- 6. Persists to UserRepository inside @Transactional boundary
             |-- 7. Writes audit log entry to AuditLogRepository
             v
[ RegistrationResponse ]  --> HTTP 201 Created (Safe DTO without credentials)
```

---

## 2. Spring Security Architecture

### 2.1 Technology Stack & Versions
- **Spring Boot:** 4.1.1
- **Spring Security:** 7.1.1
- **Hibernate ORM:** 7.4.5.Final
- **Java Target:** 21 (LTS)
- **Database Engine:** MySQL 8.0.46 (InnoDB, `utf8mb4_0900_ai_ci`)
- **JWT Library:** JJWT 0.12.6

### 2.2 SecurityFilterChain Configuration
Located in [`SecurityConfig.java`](file:///e:/CEng/Chamas-Academy/backend/src/main/java/com/chamas/academy/config/SecurityConfig.java):

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(AbstractHttpConfigurer::disable)
        .cors(Customizer.withDefaults())
        .formLogin(AbstractHttpConfigurer::disable)
        .httpBasic(AbstractHttpConfigurer::disable)
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/health").permitAll()
            .anyRequest().authenticated()
        );
    return http.build();
}
```

### 2.3 CSRF Architecture Decision
- **Decision:** CSRF protection is explicitly disabled (`AbstractHttpConfigurer::disable`).
- **Technical Justification:** Chama's Academy is designed strictly as a stateless REST API. Client authentication relies on bearer tokens transmitted via explicit HTTP `Authorization: Bearer <token>` request headers rather than automatic browser cookie management. Cross-Site Request Forgery (CSRF) vulnerabilities exploit browser behavior where session cookies are automatically attached to cross-origin requests. Because modern browsers do not automatically attach custom authorization headers to cross-origin requests, stateless token-based architectures are inherently immune to CSRF exploits.

### 2.4 CORS Configuration
A dedicated `CorsConfigurationSource` is registered for local frontend development:
- **Allowed Origins:** `http://localhost:5173` (Vite dev server), `http://localhost:3000`
- **Allowed Methods:** `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`
- **Allowed Headers:** `Authorization`, `Content-Type`, `Accept`, `X-Requested-With`
- **Exposed Headers:** `Authorization`
- **Allow Credentials:** `true`
- **Max Age:** 3600 seconds (1 hour)

---

## 3. Password Security & Hashing

- **Algorithm:** BCrypt (`BCryptPasswordEncoder`)
- **Work Factor:** 12 (adaptive cryptographic cost factor)
- **Properties:**
  - Salt is cryptographically randomized and embedded directly within the resulting hash.
  - Plaintext passwords are never logged, never persisted, and never returned in API responses.
  - Reversible encryption is strictly prohibited.
  - Minimum 8 and maximum 100 characters enforced via Bean Validation.
  - Requires uppercase, lowercase, digit, and special character.

---

## 4. Customer Registration Endpoint

### 4.1 Endpoint Specification
- **Method:** `POST`
- **URI:** `/api/auth/register`
- **Consumes:** `application/json`
- **Produces:** `application/json`
- **Access:** Public (`permitAll`)

### 4.2 Request Body (`RegistrationRequest`)
```json
{
  "firstName": "Saman",
  "lastName": "Perera",
  "email": "saman.perera@example.com",
  "password": "ExampleStrongPassword123!",
  "phoneNumber": "0771234567"
}
```

#### Field Validation Rules:
| Field | Type | Required | Constraints |
| :--- | :--- | :--- | :--- |
| `firstName` | String | Yes | 1 to 100 characters, trimmed, not blank |
| `lastName` | String | Yes | 1 to 100 characters, trimmed, not blank |
| `email` | String | Yes | Valid email format, max 255 chars, normalized (trimmed + lowercase) |
| `password` | String | Yes | 8 to 100 characters, contains >= 1 uppercase, 1 lowercase, 1 digit, 1 special character |
| `phoneNumber` | String | No | Optional, 7 to 30 characters valid phone format |

### 4.3 Default Role Assignment & Privilege Escalation Prevention
- Public registration **always and exclusively** assigns `ROLE_CUSTOMER`.
- `RegistrationRequest` does not expose `role` or `roles` fields.
- Any injected fields in the JSON payload (such as `"role": "ROLE_ADMIN"`) are ignored by the Jackson deserializer (`@JsonIgnoreProperties(ignoreUnknown = true)`).
- The service assigns `customerRole` directly via `user.setRoles(Set.of(customerRole))`.

### 4.4 Review of Unexpected JSON Properties Policy
Two architectural approaches were evaluated:
1. **Silent Discard with Strict Hardcoded Logic (Current Implementation):**
   - Extra properties like `"role": "ROLE_ADMIN"` are dropped during JSON deserialization.
   - The business logic never references client input for security fields, hardcoding `ROLE_CUSTOMER`.
   - Advantage: Client-side additive changes or gateway wrappers do not break registration.
2. **Strict Rejection (`FAIL_ON_UNKNOWN_PROPERTIES = true`):**
   - Any unknown JSON attribute causes Jackson to throw `UnrecognizedPropertyException`, returning `400 Bad Request`.
   - Advantage: Detects client typos immediately (e.g. `"fristName"`) and provides immediate feedback on mass assignment tampering attempts.
   - Trade-off: Rigid API contract.
- **Recommendation:** Keep safe discard backed by strict service-level hardcoding as default, with opt-in Jackson failure configuration if API contract governance requires strict rejection.

### 4.5 Client IP Resolution & Anti-Spoofing Policy
- **Direct Remote Address Default:** By default, `request.getRemoteAddr()` is used directly.
- **Anti-Spoofing:** Client-supplied `X-Forwarded-For` headers are **not** blindly trusted. Unverified clients could otherwise forge audit trail IP addresses or bypass IP rate limits.
- **Opt-In Reverse Proxy Integration:** `X-Forwarded-For` inspection is only enabled when explicitly configured via `chamas.security.trusted-proxy-enabled=true` behind a verified reverse proxy (e.g., NGINX, AWS ALB, Cloudflare).

### 4.6 Successful Response (`RegistrationResponse`)
- **Status:** `201 Created`
```json
{
  "id": 1,
  "firstName": "Saman",
  "lastName": "Perera",
  "email": "saman.perera@example.com",
  "phoneNumber": "0771234567",
  "roles": [
    "ROLE_CUSTOMER"
  ],
  "status": "ACTIVE",
  "createdAt": "2026-11-19T07:49:55.120Z"
}
```

---

## 5. Error Handling & Standard Error Responses

Errors are intercepted by [`GlobalExceptionHandler`](file:///e:/CEng/Chamas-Academy/backend/src/main/java/com/chamas/academy/exception/GlobalExceptionHandler.java) and converted into structured [`ErrorResponse`](file:///e:/CEng/Chamas-Academy/backend/src/main/java/com/chamas/academy/dto/ErrorResponse.java) objects without exposing internal database schemas, table names, or stack traces:

### 5.1 Validation Failure (`400 Bad Request`)
```json
{
  "timestamp": "2026-11-19T07:50:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Input validation failed",
  "path": "/api/auth/register",
  "fieldErrors": {
    "email": "Invalid email format",
    "password": "Password must be between 8 and 100 characters and contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
  }
}
```

### 5.2 Malformed JSON (`400 Bad Request`)
```json
{
  "timestamp": "2026-11-19T07:50:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Malformed JSON request payload or invalid parameter format",
  "path": "/api/auth/register"
}
```

### 5.3 Duplicate Email (`409 Conflict`)
Triggered on pre-check or concurrent database uniqueness race conditions:
```json
{
  "timestamp": "2026-11-19T07:50:00.000Z",
  "status": 409,
  "error": "Conflict",
  "message": "An account with this email address already exists.",
  "path": "/api/auth/register"
}
```

### 5.4 System Role Missing (`500 Internal Server Error`)
```json
{
  "timestamp": "2026-11-19T07:50:00.000Z",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Required system role configuration is missing. Please contact system administration.",
  "path": "/api/auth/register"
}
```

---

## 6. Audit Logging & Transactional Integrity

For every successful customer registration, an audit entry is automatically created in the `audit_logs` table within the same transaction:
- **`user_id`:** ID of the newly created user
- **`action`:** `"CUSTOMER_REGISTERED"`
- **`entity_type`:** `"USER"`
- **`entity_id`:** ID of the newly created user
- **`details`:** `{"email":"<user_email>","role":"ROLE_CUSTOMER"}` (excludes all password and credential information)
- **`ip_address`:** Authoritative client IP address resolved via anti-spoofing policy
- **`created_at`:** Database timestamp
- **Atomicity:** Audit logging participates directly in the registration transaction; if persistence fails, the entire transaction rolls back cleanly.

---

## 7. Automated Test Isolation Policy

To ensure high developer velocity and reliable CI/CD pipelines:
1. **Default Test Command:**
   ```bash
   mvn clean test -f backend/pom.xml
   ```
   Runs 100% in-memory using H2 database and Mockito unit mocks. It has **zero dependency** on the live MySQL server being running or accessible.
2. **Opt-In Live MySQL Verification:**
   ```bash
   mvn test -Dverify.mysql=true -Dtest=MySqlSchemaValidationTest -f backend/pom.xml
   ```
   Explicitly opt-in integration test requiring `-Dverify.mysql=true`. Performs strictly read-only Hibernate `ddl-auto: validate` against `localhost:3306/chamas_academy`.

---

## 8. JWT Authentication & Role-Based Access Control (RBAC) Specification

The JWT authentication and role-based access control subsystem is fully implemented, verified, and operational.

### 8.1 Dependencies
Configured in [`pom.xml`](file:///e:/CEng/Chamas-Academy/backend/pom.xml):
- `io.jsonwebtoken:jjwt-api:0.12.6`
- `io.jsonwebtoken:jjwt-impl:0.12.6` (runtime)
- `io.jsonwebtoken:jjwt-jackson:0.12.6` (runtime)

### 8.2 Token Provider Architecture (`JwtTokenProvider`)
Located in [`JwtTokenProvider.java`](file:///e:/CEng/Chamas-Academy/backend/src/main/java/com/chamas/academy/security/JwtTokenProvider.java):
- **Algorithm:** HMAC-SHA256 (`HS256`) via JJWT 0.12.6.
- **Cryptographic Key Management:** Secret key injected from externalized configuration (`chamas.jwt.secret`) via `backend/config/application-local.yml` or `CHAMAS_JWT_SECRET` environment variable.
  - Fail-secure startup check enforces a minimum key length of 256 bits (32 bytes). If the key is absent or less than 256 bits, the application immediately aborts startup with `IllegalStateException`.
  - Development secrets remain strictly in Git-ignored files (`backend/config/application-local.yml`).
- **Expiration Policy:** Default 24 hours (`86,400,000 ms`), configurable via `chamas.jwt.expiration-ms`.
- **Payload Claims:**
  - `sub`: User's normalized email address.
  - `userId`: Numeric user ID (`Long`).
  - `roles`: List of assigned role names (e.g., `["ROLE_CUSTOMER"]`).
  - `iat`: Timestamp of token issuance.
  - `exp`: Timestamp of token expiration.

### 8.3 JWT Authentication Filter (`JwtAuthenticationFilter`)
Located in [`JwtAuthenticationFilter.java`](file:///e:/CEng/Chamas-Academy/backend/src/main/java/com/chamas/academy/security/JwtAuthenticationFilter.java):
- Extends Spring's `OncePerRequestFilter`.
- Intercepts incoming HTTP requests and inspects the `Authorization: Bearer <token>` header.
- Validates token signature, integrity, and expiration using `JwtTokenProvider.validateToken(token)`.
- **Dynamic Database Authority Verification:** Rather than blindly trusting cached authorities in the JWT claims payload, the filter re-queries the authoritative user record via `CustomUserDetailsService` / `UserRepository`:
  - Enforces active status: If the user status has changed to `SUSPENDED` or `INACTIVE`, authentication is immediately denied.
  - Reflects real-time role modifications: If an administrator grants or revokes roles, changes take effect immediately on subsequent requests without requiring token re-issuance.
- Sets authenticated `UsernamePasswordAuthenticationToken` in `SecurityContextHolder`.

### 8.4 Centralized Security Entry Points
- **`JwtAuthenticationEntryPoint`:** Intercepts unauthenticated or invalid token requests (RFC 6750) and returns HTTP 401 Unauthorized with standard structured JSON `ErrorResponse`:
  ```json
  {
    "timestamp": "2026-11-19T08:30:00.000Z",
    "status": 401,
    "error": "Unauthorized",
    "message": "Full authentication is required to access this resource",
    "path": "/api/auth/me"
  }
  ```
- **`JwtAccessDeniedHandler`:** Intercepts authenticated requests with insufficient privileges (e.g., customer accessing `/api/admin/**`) and returns HTTP 403 Forbidden with standard structured JSON `ErrorResponse`:
  ```json
  {
    "timestamp": "2026-11-19T08:30:00.000Z",
    "status": 403,
    "error": "Forbidden",
    "message": "Access is denied: insufficient permissions for this resource",
    "path": "/api/admin/dashboard"
  }
  ```

### 8.5 Login Endpoint Specification
- **Method:** `POST`
- **URI:** `/api/auth/login`
- **Access:** Public (`permitAll`)
- **Request Body (`LoginRequest`):**
  ```json
  {
    "email": "customer@example.com",
    "password": "ExampleStrongPassword123!"
  }
  ```
- **Response (`200 OK` - `LoginResponse`):**
  ```json
  {
    "tokenType": "Bearer",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "user": {
      "id": 1,
      "email": "customer@example.com",
      "firstName": "Saman",
      "lastName": "Perera",
      "roles": ["ROLE_CUSTOMER"]
    }
  }
  ```
- **Security Protections:**
  - `email` is automatically trimmed and normalized to lowercase.
  - `BadCredentialsException` returns HTTP 401 with generic message: `"Invalid email or password"` to prevent username enumeration.
  - Suspended or inactive accounts are rejected with HTTP 403: `"Account is deactivated or suspended"`.

### 8.6 Current User Endpoint (`GET /api/auth/me`)
- **Method:** `GET`
- **URI:** `/api/auth/me`
- **Access:** Authenticated (`anyRequest().authenticated()`)
- Resolves authenticated principal from `SecurityContextHolder` and returns safe user profile data (`UserProfileResponse`):
  ```json
  {
    "id": 1,
    "firstName": "Saman",
    "lastName": "Perera",
    "email": "customer@example.com",
    "phoneNumber": "0771234567",
    "roles": ["ROLE_CUSTOMER"],
    "status": "ACTIVE"
  }
  ```

### 8.7 Role-Based Access Control (RBAC) & Administrative Endpoints
- Method security enabled globally via `@EnableMethodSecurity`.
- Endpoints under `/api/admin/**` are strictly restricted to users possessing `ROLE_ADMIN` at both URL pattern level in `SecurityFilterChain` (`.requestMatchers("/api/admin/**").hasRole("ADMIN")`) and controller level (`@PreAuthorize("hasRole('ADMIN')")`).
- Test administration endpoint: `GET /api/admin/dashboard` in [`AdminTestController.java`](file:///e:/CEng/Chamas-Academy/backend/src/main/java/com/chamas/academy/controller/AdminTestController.java).

### 8.8 Audit Logging
Every authentication attempt is audited in the `audit_logs` table:
- **`LOGIN_SUCCESS`:** Records user ID, client IP address, and details `{"email":"..."}`.
- **`LOGIN_FAILURE`:** Records client IP address, details `{"email":"...","reason":"INVALID_CREDENTIALS"}` or `{"email":"...","reason":"ACCOUNT_SUSPENDED"}`. Plaintext passwords and tokens are never logged.

### 8.9 Logout & Revocation Strategy
- In this stateless JWT implementation, client logout is completed by deleting the stored access token from client-side storage.
- Server-side revocation limitations: Stateless tokens remain valid until expiration unless a server-side token blocklist / JTI revocation table is introduced in future milestones.
