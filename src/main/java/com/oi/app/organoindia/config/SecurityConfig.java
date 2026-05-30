package com.oi.app.organoindia.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.oi.app.organoindia.exception.AuthEntryPoint;
import com.oi.app.organoindia.exception.CustomAccessDeniedHandler;
import com.oi.app.organoindia.security.JwtFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // enables @PreAuthorize on service methods
@RequiredArgsConstructor
public class SecurityConfig {

        private static final String CONTENT_SECURITY_POLICY = "default-src 'self'; "
                        + "script-src 'self'; "
                        + "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                        + "font-src 'self' https://fonts.gstatic.com; "
                        + "img-src 'self' data: https:; "
                        + "connect-src 'self'";

        private final JwtFilter jwtFilter;
        private final AuthEntryPoint authEntryPoint;
        private final CustomAccessDeniedHandler accessDeniedHandler;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(AbstractHttpConfigurer::disable) // stateless JWT, no CSRF needed
                                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                .authorizeHttpRequests(auth -> auth
                                                // Public — auth endpoints
                                                .requestMatchers("/api/auth/**").permitAll()

                                                // Public — browsing the store
                                                .requestMatchers("/", "/index.html", "/assets/**", "/favicon.ico",
                                                                "/vite.svg")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()

                                                // Admin-only — product/category management
                                                .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                                                // Admin namespace
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                                                // Anything else to /api requires authentication (ADMIN or CUSTOMER)
                                                .requestMatchers("/api/**").authenticated()
                                                .anyRequest().permitAll())

                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint(authEntryPoint) // 401 as JSON
                                                .accessDeniedHandler(accessDeniedHandler) // 403 as JSON
                                )

                                .headers(h -> h
                                                .httpStrictTransportSecurity(hsts -> hsts
                                                                .includeSubDomains(true)
                                                                .maxAgeInSeconds(31536000))
                                                .frameOptions(frame -> frame.deny())
                                                .contentSecurityPolicy(
                                                                csp -> csp.policyDirectives(CONTENT_SECURITY_POLICY)))

                                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }
}
