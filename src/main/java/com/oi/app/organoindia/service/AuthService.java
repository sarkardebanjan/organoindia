package com.oi.app.organoindia.service;

import com.oi.app.organoindia.dto.AuthResponse;
import com.oi.app.organoindia.dto.LoginRequest;
import com.oi.app.organoindia.dto.RefreshRequest;
import com.oi.app.organoindia.dto.RegisterRequest;
import com.oi.app.organoindia.model.RefreshToken;
import com.oi.app.organoindia.model.Role;
import com.oi.app.organoindia.model.User;
import com.oi.app.organoindia.repository.UserRepository;
import com.oi.app.organoindia.security.CustomUserDetailsService;
import com.oi.app.organoindia.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final CustomUserDetailsService userDetailsService;

    public AuthResponse login(LoginRequest request) {
        // Spring Security validates credentials — throws BadCredentialsException on failure
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.email());
        String accessToken = jwtUtil.generate(userDetails);
        RefreshToken refreshToken = refreshTokenService.create(request.email());

        String role = userDetails.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .findFirst()
                .orElse("ROLE_CUSTOMER");

        return new AuthResponse(accessToken, refreshToken.getToken(), request.email(), role);
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRoles(Set.of(Role.ROLE_CUSTOMER));
        user.setEnabled(true);

        userRepository.save(user);

        // Log them in immediately after registration
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.email());
        String accessToken = jwtUtil.generate(userDetails);
        RefreshToken refreshToken = refreshTokenService.create(request.email());

        return new AuthResponse(accessToken, refreshToken.getToken(), request.email(), "ROLE_CUSTOMER");
    }

    public AuthResponse refresh(RefreshRequest request) {
        RefreshToken refreshToken = refreshTokenService.validate(request.refreshToken());

        UserDetails userDetails = userDetailsService.loadUserByUsername(
                refreshToken.getUser().getEmail()
        );
        String newAccessToken = jwtUtil.generate(userDetails);

        String role = userDetails.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .findFirst()
                .orElse("ROLE_CUSTOMER");

        // Reuse same refresh token — no rotation needed for this scale
        return new AuthResponse(
                newAccessToken,
                request.refreshToken(),
                refreshToken.getUser().getEmail(),
                role
        );
    }

    public void logout(RefreshRequest request) {
        refreshTokenService.deleteByToken(request.refreshToken());
    }
}
