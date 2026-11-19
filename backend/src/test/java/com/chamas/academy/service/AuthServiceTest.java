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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private ObjectProvider<UserRepository> userRepositoryProvider;

    @Mock
    private ObjectProvider<RoleRepository> roleRepositoryProvider;

    @Mock
    private ObjectProvider<AuditLogRepository> auditLogRepositoryProvider;

    @Mock
    private ObjectProvider<AuthenticationManager> authenticationManagerProvider;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        when(userRepositoryProvider.getIfAvailable()).thenReturn(userRepository);
        lenient().when(roleRepositoryProvider.getIfAvailable()).thenReturn(roleRepository);
        lenient().when(auditLogRepositoryProvider.getIfAvailable()).thenReturn(auditLogRepository);
        lenient().when(authenticationManagerProvider.getIfAvailable()).thenReturn(authenticationManager);

        authService = new AuthService(
                userRepositoryProvider,
                roleRepositoryProvider,
                auditLogRepositoryProvider,
                authenticationManagerProvider,
                passwordEncoder,
                jwtTokenProvider
        );
    }

    @Test
    @DisplayName("Successfully registers customer with normalized email, hashed password, and default ROLE_CUSTOMER")
    void shouldRegisterCustomerSuccessfully() {
        RegistrationRequest request = new RegistrationRequest(
                "Jane",
                "Doe",
                "  Jane.Doe@EXAMPLE.COM  ",
                "StrongPassword123!",
                "0771234567"
        );

        Role customerRole = new Role(Role.ROLE_CUSTOMER, "Customer role");
        customerRole.setId(1L);

        when(userRepository.existsByEmail("jane.doe@example.com")).thenReturn(false);
        when(roleRepository.findByName(Role.ROLE_CUSTOMER)).thenReturn(Optional.of(customerRole));
        when(passwordEncoder.encode("StrongPassword123!")).thenReturn("$2a$12$mockHashedPasswordValue1234567890");

        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(100L);
            return u;
        });

        RegistrationResponse response = authService.registerCustomer(request, "127.0.0.1");

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getEmail()).isEqualTo("jane.doe@example.com");
        assertThat(response.getFirstName()).isEqualTo("Jane");
        assertThat(response.getLastName()).isEqualTo("Doe");
        assertThat(response.getPhoneNumber()).isEqualTo("0771234567");
        assertThat(response.getRoles()).containsExactly(Role.ROLE_CUSTOMER);
        assertThat(response.getStatus()).isEqualTo(User.STATUS_ACTIVE);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).saveAndFlush(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getEmail()).isEqualTo("jane.doe@example.com");
        assertThat(savedUser.getPasswordHash()).isEqualTo("$2a$12$mockHashedPasswordValue1234567890");
        assertThat(savedUser.getPasswordHash()).isNotEqualTo("StrongPassword123!");

        ArgumentCaptor<AuditLog> auditCaptor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(auditCaptor.capture());
        AuditLog audit = auditCaptor.getValue();
        assertThat(audit.getAction()).isEqualTo("CUSTOMER_REGISTERED");
        assertThat(audit.getEntityType()).isEqualTo("USER");
        assertThat(audit.getEntityId()).isEqualTo(100L);
        assertThat(audit.getDetails()).doesNotContain("StrongPassword123!");
        assertThat(audit.getDetails()).doesNotContain("mockHashedPasswordValue");
        assertThat(audit.getDetails()).contains("jane.doe@example.com");
    }

    @Test
    @DisplayName("Throws DuplicateEmailException when email is already registered")
    void shouldThrowDuplicateEmailExceptionWhenEmailExists() {
        RegistrationRequest request = new RegistrationRequest(
                "Jane", "Doe", "existing@example.com", "StrongPassword123!", null
        );

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.registerCustomer(request, "127.0.0.1"))
                .isInstanceOf(DuplicateEmailException.class)
                .hasMessageContaining("already exists");

        verify(userRepository, never()).saveAndFlush(any());
        verify(auditLogRepository, never()).save(any());
    }

    @Test
    @DisplayName("Handles database uniqueness race condition gracefully by converting DataIntegrityViolationException")
    void shouldHandleDatabaseRaceCondition() {
        RegistrationRequest request = new RegistrationRequest(
                "Race", "Condition", "race@example.com", "StrongPassword123!", null
        );

        Role customerRole = new Role(Role.ROLE_CUSTOMER, "Customer role");
        customerRole.setId(1L);

        when(userRepository.existsByEmail("race@example.com")).thenReturn(false);
        when(roleRepository.findByName(Role.ROLE_CUSTOMER)).thenReturn(Optional.of(customerRole));
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPwd");
        when(userRepository.saveAndFlush(any(User.class)))
                .thenThrow(new DataIntegrityViolationException("Duplicate entry 'race@example.com' for key 'uk_users_email'"));

        assertThatThrownBy(() -> authService.registerCustomer(request, "127.0.0.1"))
                .isInstanceOf(DuplicateEmailException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    @DisplayName("Throws RoleNotFoundException when ROLE_CUSTOMER is missing in database")
    void shouldThrowRoleNotFoundExceptionWhenCustomerRoleMissing() {
        RegistrationRequest request = new RegistrationRequest(
                "Jane", "Doe", "new@example.com", "StrongPassword123!", null
        );

        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(roleRepository.findByName(Role.ROLE_CUSTOMER)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.registerCustomer(request, "127.0.0.1"))
                .isInstanceOf(RoleNotFoundException.class)
                .hasMessageContaining("ROLE_CUSTOMER");

        verify(userRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("Successfully authenticates user and issues JWT token")
    void shouldLoginSuccessfully() {
        LoginRequest loginRequest = new LoginRequest("user@example.com", "Password123!");

        Authentication authResult = new UsernamePasswordAuthenticationToken(
                "user@example.com",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authResult);

        User user = new User("user@example.com", "hashed", "Jane", "Doe", "0771234567");
        user.setId(201L);
        user.setStatus(User.STATUS_ACTIVE);
        user.setRoles(Set.of(new Role(Role.ROLE_CUSTOMER, "Customer")));
        user.setCreatedAt(Instant.now());

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(jwtTokenProvider.generateToken(eq(201L), eq("user@example.com"), any())).thenReturn("mock.jwt.token");
        when(jwtTokenProvider.getExpirationSeconds()).thenReturn(86400L);

        LoginResponse response = authService.login(loginRequest, "127.0.0.1");

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("mock.jwt.token");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getExpiresIn()).isEqualTo(86400L);
        assertThat(response.getUser().getEmail()).isEqualTo("user@example.com");
        assertThat(response.getRoles()).containsExactly("ROLE_CUSTOMER");

        verify(auditLogRepository).saveAndFlush(any(AuditLog.class));
    }

    @Test
    @DisplayName("Throws BadCredentialsException on invalid login credentials and commits audit failure log")
    void shouldThrowBadCredentialsOnInvalidPassword() {
        LoginRequest loginRequest = new LoginRequest("user@example.com", "WrongPassword!");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(loginRequest, "127.0.0.1"))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Invalid email or password");

        verify(jwtTokenProvider, never()).generateToken(any(), any(), any());

        ArgumentCaptor<AuditLog> auditCaptor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).saveAndFlush(auditCaptor.capture());
        AuditLog failedAudit = auditCaptor.getValue();
        assertThat(failedAudit.getAction()).isEqualTo("LOGIN_FAILURE");
        assertThat(failedAudit.getDetails()).contains("INVALID_CREDENTIALS");
        assertThat(failedAudit.getDetails()).doesNotContain("WrongPassword!");
    }

    @Test
    @DisplayName("Throws DisabledException when attempting to login with inactive account")
    void shouldThrowDisabledExceptionForInactiveAccount() {
        LoginRequest loginRequest = new LoginRequest("inactive@example.com", "Password123!");

        Authentication authResult = new UsernamePasswordAuthenticationToken(
                "inactive@example.com",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authResult);

        User user = new User("inactive@example.com", "hashed", "Suspended", "User", null);
        user.setId(202L);
        user.setStatus(User.STATUS_SUSPENDED);

        when(userRepository.findByEmail("inactive@example.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(loginRequest, "127.0.0.1"))
                .isInstanceOf(DisabledException.class)
                .hasMessageContaining("inactive or suspended");

        verify(jwtTokenProvider, never()).generateToken(any(), any(), any());
    }

    @Test
    @DisplayName("Resolves current user profile by email")
    void shouldGetCurrentUserProfile() {
        User user = new User("me@example.com", "hashed", "My", "Self", "0770000000");
        user.setId(301L);
        user.setStatus(User.STATUS_ACTIVE);
        user.setRoles(Set.of(new Role(Role.ROLE_CUSTOMER, "Customer")));
        user.setCreatedAt(Instant.now());

        when(userRepository.findByEmail("me@example.com")).thenReturn(Optional.of(user));

        UserProfileResponse profile = authService.getCurrentUser("me@example.com");

        assertThat(profile).isNotNull();
        assertThat(profile.getId()).isEqualTo(301L);
        assertThat(profile.getEmail()).isEqualTo("me@example.com");
        assertThat(profile.getFirstName()).isEqualTo("My");
        assertThat(profile.getRoles()).containsExactly("ROLE_CUSTOMER");
    }

    @Test
    @DisplayName("Throws UsernameNotFoundException when current user not found in database")
    void shouldThrowUsernameNotFoundWhenUserMissing() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.getCurrentUser("missing@example.com"))
                .isInstanceOf(UsernameNotFoundException.class);
    }
}
