package com.oi.app.organoindia.repository;

import com.oi.app.organoindia.model.RefreshToken;
import com.oi.app.organoindia.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    void deleteByUser(User user);

    void deleteByToken(String token);
}
