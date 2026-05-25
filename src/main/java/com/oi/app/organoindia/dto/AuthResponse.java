package com.oi.app.organoindia.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String email,
        String role
) {}