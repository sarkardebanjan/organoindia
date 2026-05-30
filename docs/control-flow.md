# Control Flow And Data Flow

## Application Startup Flow

```mermaid
sequenceDiagram
    participant JVM
    participant App as OrganoindiaApplication
    participant Spring as Spring Boot Context
    participant Security as SecurityConfig
    participant Init as DataInitializer
    participant Users as UserRepository
    participant Encoder as PasswordEncoder

    JVM->>App: main(args)
    App->>Spring: SpringApplication.run(...)
    Spring->>Security: create SecurityFilterChain bean
    Security->>Security: disable CSRF and set stateless sessions
    Security->>Security: configure route authorization rules
    Security->>Security: add JwtFilter before UsernamePasswordAuthenticationFilter
    Spring->>Security: create PasswordEncoder bean
    Spring->>Security: create AuthenticationManager bean
    Spring->>Init: run(ApplicationArguments)
    Init->>Users: existsByEmail(adminEmail)
    alt admin missing
        Init->>Encoder: encode(adminPassword)
        Init->>Users: save(admin with ROLE_ADMIN)
    else admin exists
        Init-->>Spring: no database write
    end
```

## Registration Flow

Endpoint: `POST /api/auth/register`

```mermaid
sequenceDiagram
    participant Client
    participant Controller as AuthController.register
    participant Service as AuthService.register
    participant Users as UserRepository
    participant Encoder as PasswordEncoder
    participant UDS as CustomUserDetailsService
    participant JWT as JwtUtil
    participant Refresh as RefreshTokenService
    participant RTRepo as RefreshTokenRepository

    Client->>Controller: RegisterRequest(email, password)
    Controller->>Service: register(request)
    Service->>Users: existsByEmail(email)
    alt email already exists
        Service-->>Controller: throw IllegalArgumentException
        Controller-->>Client: 409 JSON via GlobalExceptionHandler
    else new email
        Service->>Encoder: encode(password)
        Service->>Users: save(User with ROLE_CUSTOMER)
        Service->>UDS: loadUserByUsername(email)
        UDS->>Users: findByEmail(email)
        UDS-->>Service: UserDetails
        Service->>JWT: generate(UserDetails)
        Service->>Refresh: create(email)
        Refresh->>Users: findByEmail(email)
        Refresh->>RTRepo: deleteByUser(user)
        Refresh->>RTRepo: save(new UUID token)
        Refresh-->>Service: RefreshToken
        Service-->>Controller: AuthResponse(access, refresh, email, ROLE_CUSTOMER)
        Controller-->>Client: 201 Created
    end
```

Control notes:

- Request validation happens before controller logic because `RegisterRequest` is annotated and controller parameter uses `@Valid`.
- Duplicate emails are rejected before any password hashing or token creation.
- A successfully registered user is immediately logged in.

## Login Flow

Endpoint: `POST /api/auth/login`

```mermaid
sequenceDiagram
    participant Client
    participant Controller as AuthController.login
    participant Service as AuthService.login
    participant AuthManager as AuthenticationManager
    participant UDS as CustomUserDetailsService
    participant Users as UserRepository
    participant JWT as JwtUtil
    participant Refresh as RefreshTokenService

    Client->>Controller: LoginRequest(email, password)
    Controller->>Service: login(request)
    Service->>AuthManager: authenticate(email, password)
    alt invalid credentials
        AuthManager-->>Service: BadCredentialsException
        Service-->>Controller: exception
        Controller-->>Client: 401 JSON via GlobalExceptionHandler
    else valid credentials
        Service->>UDS: loadUserByUsername(email)
        UDS->>Users: findByEmail(email)
        UDS-->>Service: UserDetails
        Service->>JWT: generate(UserDetails)
        Service->>Refresh: create(email)
        Refresh-->>Service: RefreshToken
        Service-->>Controller: AuthResponse(access, refresh, email, role)
        Controller-->>Client: 200 OK
    end
```

Control notes:

- Credential checking is delegated to Spring Security.
- The method extracts the first authority from `UserDetails`; if none exists, it falls back to `ROLE_CUSTOMER`.
- Creating a refresh token invalidates any older refresh token for the same user.

## Access-Token Refresh Flow

Endpoint: `POST /api/auth/refresh`

```mermaid
sequenceDiagram
    participant Client
    participant Controller as AuthController.refresh
    participant Service as AuthService.refresh
    participant Refresh as RefreshTokenService
    participant RTRepo as RefreshTokenRepository
    participant UDS as CustomUserDetailsService
    participant JWT as JwtUtil

    Client->>Controller: RefreshRequest(refreshToken)
    Controller->>Service: refresh(request)
    Service->>Refresh: validate(rawToken)
    Refresh->>RTRepo: findByToken(rawToken)
    alt missing token
        Refresh-->>Service: IllegalStateException("Invalid refresh token")
        Service-->>Controller: exception
        Controller-->>Client: 401 JSON via GlobalExceptionHandler
    else expired token
        Refresh->>RTRepo: delete(token)
        Refresh-->>Service: IllegalStateException("Refresh token expired...")
        Service-->>Controller: exception
        Controller-->>Client: 401 JSON via GlobalExceptionHandler
    else valid token
        Refresh-->>Service: RefreshToken
        Service->>UDS: loadUserByUsername(token.user.email)
        Service->>JWT: generate(UserDetails)
        Service-->>Controller: AuthResponse(newAccess, sameRefresh, email, role)
        Controller-->>Client: 200 OK
    end
```

Control notes:

- Refresh tokens are not JWTs; they are opaque UUIDs stored in the database.
- The refresh flow generates a new access token but returns the same refresh token.
- Expired refresh tokens are deleted as part of validation.

## Logout Flow

Endpoint: `POST /api/auth/logout`

```mermaid
sequenceDiagram
    participant Client
    participant Controller as AuthController.logout
    participant Service as AuthService.logout
    participant Refresh as RefreshTokenService
    participant RTRepo as RefreshTokenRepository

    Client->>Controller: RefreshRequest(refreshToken)
    Controller->>Service: logout(request)
    Service->>Refresh: deleteByToken(refreshToken)
    Refresh->>RTRepo: deleteByToken(refreshToken)
    Controller-->>Client: 204 No Content
```

Control notes:

- Logout invalidates the refresh token server-side.
- Existing JWT access tokens remain valid until their expiration because the app is stateless and does not maintain an access-token denylist.

## Protected Request Flow

This flow applies to any request that includes `Authorization: Bearer <token>`.

```mermaid
flowchart TD
    A[Incoming HTTP request] --> B[JwtFilter.doFilterInternal]
    B --> C{Authorization header exists and starts with Bearer?}
    C -- No --> D[Continue filter chain without authentication]
    C -- Yes --> E[Extract token after Bearer prefix]
    E --> F{jwtUtil.isValid(token)?}
    F -- No --> D
    F -- Yes --> G{SecurityContext authentication is empty?}
    G -- No --> K[Continue filter chain]
    G -- Yes --> H[jwtUtil.extractUsername(token)]
    H --> I[jwtUtil.extractRoles(token)]
    I --> J[Create UsernamePasswordAuthenticationToken]
    J --> L[Set web auth details]
    L --> M[Store auth in SecurityContextHolder]
    M --> K
    D --> N{Endpoint requires auth?}
    K --> N
    N -- Missing/invalid auth --> O[AuthEntryPoint returns 401 JSON]
    N -- Valid auth, insufficient role --> P[CustomAccessDeniedHandler returns 403 JSON]
    N -- Allowed --> Q[Controller/service executes]
```

Control notes:

- `JwtFilter` does not directly return a 401 for missing or invalid tokens.
- It leaves unauthenticated requests to continue; Spring Security later decides whether the target endpoint permits anonymous access.
- Roles are trusted from the signed JWT, so normal protected requests do not need a database lookup.

## Exception Response Flow

```mermaid
flowchart LR
    BadCredentialsException --> A[GlobalExceptionHandler.handleBadCredentials] --> R401A[401 Invalid credentials]
    DisabledException --> B[GlobalExceptionHandler.handleDisabled] --> R403A[403 Account is disabled]
    MethodArgumentNotValidException --> C[GlobalExceptionHandler.handleValidation] --> R400[400 field validation messages]
    IllegalStateException --> D[GlobalExceptionHandler.handleIllegalState] --> R401B[401 refresh token error]
    IllegalArgumentException --> E[GlobalExceptionHandler.handleIllegalArg] --> R409[409 conflict]
    AuthenticationException --> F[AuthEntryPoint.commence] --> R401C[401 Missing or invalid token]
    AccessDeniedException --> G[CustomAccessDeniedHandler.handle] --> R403B[403 insufficient permission]
```

