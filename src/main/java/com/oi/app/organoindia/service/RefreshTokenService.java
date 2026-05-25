package com.oi.app.organoindia.service;

import com.oi.app.organoindia.model.RefreshToken;
import com.oi.app.organoindia.model.User;
import com.oi.app.organoindia.repository.RefreshTokenRepository;
import com.oi.app.organoindia.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Value("${app.jwt.refresh-expiry-days:7}")
    private long refreshExpiryDays;

    @Transactional
    public RefreshToken create(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        // One refresh token per user — delete old one if present
        refreshTokenRepository.deleteByUser(user);

        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiresAt(Instant.now().plusSeconds(refreshExpiryDays * 86400));

        return refreshTokenRepository.save(token);
    }

    @Transactional
    public RefreshToken validate(String rawToken) {
        RefreshToken token = refreshTokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new IllegalStateException("Invalid refresh token"));

        if (token.isExpired()) {
            refreshTokenRepository.delete(token);
            throw new IllegalStateException("Refresh token expired, please log in again");
        }

        return token;
    }

    @Transactional
    public void deleteByToken(String rawToken) {
        refreshTokenRepository.deleteByToken(rawToken);
    }
}