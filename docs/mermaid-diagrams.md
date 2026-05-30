# Mermaid Diagrams

This file collects diagrams from the documentation in a standalone format.

## Package Dependency Overview

```mermaid
flowchart TD
    controller[controller]
    service[service]
    security[security]
    repository[repository]
    model[model]
    dto[dto]
    exception[exception]
    config[config]

    controller --> dto
    controller --> service
    service --> dto
    service --> model
    service --> repository
    service --> security
    security --> model
    security --> repository
    repository --> model
    config --> security
    config --> exception
    config --> repository
    config --> model
```

## Auth Controller To Persistence

```mermaid
flowchart LR
    AuthController --> AuthService
    AuthService --> AuthenticationManager
    AuthService --> CustomUserDetailsService
    AuthService --> JwtUtil
    AuthService --> RefreshTokenService
    AuthService --> UserRepository
    AuthService --> PasswordEncoder
    CustomUserDetailsService --> UserRepository
    RefreshTokenService --> UserRepository
    RefreshTokenService --> RefreshTokenRepository
    UserRepository --> User
    RefreshTokenRepository --> RefreshToken
    RefreshToken --> User
```

## Entity Relationship Diagram

```mermaid
erDiagram
    USER {
        Long ID PK
        String FIRST_NAME
        String LAST_NAME
        String EMAIL UK
        String PASSWORD
        boolean ENABLED
    }

    USER_ROLES {
        Long USER_ID FK
        String role
    }

    refresh_tokens {
        Long ID PK
        String TOKEN UK
        Instant EXPIRES_AT
        Long USER_ID FK
    }

    PRODUCT {
        Long id PK
        String NAME
        BigDecimal RATE
        Timestamp LAST_UPDATED_TIME
    }

    USER ||--o{ USER_ROLES : has
    USER ||--o| refresh_tokens : has
```

## JWT Filter Decision Tree

```mermaid
flowchart TD
    A[Request enters JwtFilter] --> B{Authorization header starts with Bearer?}
    B -- No --> C[Do not set authentication]
    B -- Yes --> D[Extract token]
    D --> E{Token parses and verifies?}
    E -- No --> C
    E -- Yes --> F{SecurityContext already has authentication?}
    F -- Yes --> G[Keep existing authentication]
    F -- No --> H[Extract subject as username]
    H --> I[Extract roles claim as authorities]
    I --> J[Create UsernamePasswordAuthenticationToken]
    J --> K[Set SecurityContext authentication]
    C --> L[Continue filter chain]
    G --> L
    K --> L
```

## Auth Endpoint Flows

```mermaid
flowchart TD
    Register[POST /api/auth/register] --> RegisterService[AuthService.register]
    RegisterService --> Exists{email exists?}
    Exists -- Yes --> Conflict[409 Email already registered]
    Exists -- No --> SaveUser[Save ROLE_CUSTOMER user]
    SaveUser --> IssueTokens[Generate JWT and refresh token]
    IssueTokens --> Created[201 AuthResponse]

    Login[POST /api/auth/login] --> LoginService[AuthService.login]
    LoginService --> Authenticate{AuthenticationManager accepts credentials?}
    Authenticate -- No --> Unauthorized[401 Invalid credentials]
    Authenticate -- Yes --> LoginTokens[Generate JWT and refresh token]
    LoginTokens --> OkLogin[200 AuthResponse]

    Refresh[POST /api/auth/refresh] --> RefreshService[AuthService.refresh]
    RefreshService --> ValidRefresh{RefreshTokenService.validate succeeds?}
    ValidRefresh -- No --> RefreshUnauthorized[401 refresh token error]
    ValidRefresh -- Yes --> NewAccess[Generate new JWT]
    NewAccess --> OkRefresh[200 AuthResponse with same refresh token]

    Logout[POST /api/auth/logout] --> LogoutService[AuthService.logout]
    LogoutService --> DeleteRefresh[Delete refresh token]
    DeleteRefresh --> NoContent[204 No Content]
```

## Startup Flow

```mermaid
flowchart TD
    Main[OrganoindiaApplication.main] --> Run[SpringApplication.run]
    Run --> Beans[Create Spring beans]
    Beans --> SecurityBeans[SecurityConfig beans]
    Beans --> Initializer[DataInitializer.run]
    Initializer --> AdminExists{admin email already exists?}
    AdminExists -- Yes --> Done[Startup continues]
    AdminExists -- No --> Encode[Encode admin password]
    Encode --> SaveAdmin[Save enabled ROLE_ADMIN user]
    SaveAdmin --> Done
```

