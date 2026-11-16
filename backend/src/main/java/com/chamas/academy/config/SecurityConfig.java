package com.chamas.academy.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration for Chama's Academy Backend.
 *
 * Architecture decisions:
 * 1. CSRF is disabled because this backend is a stateless REST API that will use JWT Bearer
 *    tokens in request headers rather than browser-managed cookie sessions.
 * 2. Session management is strictly STATELESS, preventing server-side HTTP session overhead.
 * 3. Form login and HTTP Basic are disabled to enforce API-oriented client authentication.
 * 4. The /api/health endpoint is publicly accessible; all other endpoints require authentication by default.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // CSRF protection is not required for stateless REST APIs using JWT tokens
            .csrf(AbstractHttpConfigurer::disable)

            // Disable standard browser authentication mechanisms
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)

            // Stateless session lifecycle (no HttpSession stored on server)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Endpoint authorization rules
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/health").permitAll()
                .anyRequest().authenticated()
            );

        return http.build();
    }

    /**
     * Standard BCrypt password encoder for future authentication workflows.
     *
     * @return BCryptPasswordEncoder bean with standard work factor (10)
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
