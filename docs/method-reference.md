# Method Reference

This file documents each class and method in the current source tree. Generated Lombok getters, setters, constructors, and record accessors are noted by class rather than repeated method-by-method.

## Root Package

### `OrganoindiaApplication`

File: `src/main/java/com/oi/app/organoindia/OrganoindiaApplication.java`

#### `main(String[] args)`

- Entry point for the JVM process.
- Calls `SpringApplication.run(OrganoindiaApplication.class, args)`.
- Starts component scanning, auto-configuration, embedded web server setup, bean creation, and lifecycle callbacks such as `ApplicationRunner.run`.

## `config`

### `SecurityConfig`

File: `src/main/java/com/oi/app/organoindia/config/SecurityConfig.java`

Annotations:

- `@Configuration`: registers this class as a source of Spring beans.
- `@EnableWebSecurity`: enables Spring Security web integration.
- `@EnableMethodSecurity`: enables method-level security annotations such as `@PreAuthorize`.
- `@RequiredArgsConstructor`: Lombok generates constructor injection for final fields.

Fields:

- `JwtFilter jwtFilter`: validates JWT bearer tokens.
- `AuthEntryPoint authEntryPoint`: writes JSON `401` responses for unauthenticated protected access.
- `CustomAccessDeniedHandler accessDeniedHandler`: writes JSON `403` responses for authenticated users without required roles.

#### `filterChain(HttpSecurity http)`

- Creates the main `SecurityFilterChain` bean.
- Disables CSRF because the app uses stateless bearer token auth.
- Sets session policy to `STATELESS`, preventing server-side HTTP sessions.
- Defines route-level authorization:
  - Auth endpoints are public.
  - Product/category GET endpoints are public.
  - Product writes and admin namespace require admin role.
  - All other endpoints require authentication.
- Registers JSON handlers for authentication and authorization failures.
- Adds defensive headers: HSTS, denied frame options, and Content Security Policy.
- Inserts `JwtFilter` before Spring's `UsernamePasswordAuthenticationFilter`.
- Returns `http.build()`.

#### `passwordEncoder()`

- Creates a `BCryptPasswordEncoder`.
- Used by `AuthService.register` and `DataInitializer.run` for password hashing.
- Also used by Spring Security during login credential checks.

#### `authenticationManager(AuthenticationConfiguration config)`

- Obtains Spring Security's configured `AuthenticationManager`.
- Used by `AuthService.login` to authenticate email/password login requests.

### `DataInitializer`

File: `src/main/java/com/oi/app/organoindia/config/DataInitializer.java`

Annotations:

- `@Component`: makes the initializer a Spring bean.
- `@RequiredArgsConstructor`: injects `UserRepository` and `PasswordEncoder`.
- `@Slf4j`: provides the `log` field.

Fields:

- `UserRepository userRepository`: checks and persists admin users.
- `PasswordEncoder passwordEncoder`: hashes the configured admin password.
- `String adminEmail`: injected from `app.admin.email`.
- `String adminPassword`: injected from `app.admin.password`.

#### `run(ApplicationArguments args)`

- Runs once after the Spring application context is ready.
- Checks whether a user already exists with `adminEmail`.
- If not found:
  - Creates a `User`.
  - Sets email, encoded password, `ROLE_ADMIN`, and enabled status.
  - Saves the user.
  - Logs that the admin user was created.
- If found, does nothing.

## `controller`

### `AuthController`

File: `src/main/java/com/oi/app/organoindia/controller/AuthController.java`

Base route: `/api/auth`

Fields:

- `AuthService authService`: owns all auth business logic.

#### `register(RegisterRequest request)`

- Route: `POST /api/auth/register`.
- Validates the request body with Jakarta validation.
- Delegates to `authService.register(request)`.
- Returns `201 Created` with `AuthResponse`.
- Failure paths:
  - Invalid payload: `400` via `GlobalExceptionHandler.handleValidation`.
  - Existing email: `409` via `GlobalExceptionHandler.handleIllegalArg`.

#### `login(LoginRequest request)`

- Route: `POST /api/auth/login`.
- Validates email and password payload.
- Delegates to `authService.login(request)`.
- Returns `200 OK` with `AuthResponse`.
- Failure paths:
  - Invalid payload: `400`.
  - Wrong credentials: `401`.
  - Disabled account: `403`.

#### `refresh(RefreshRequest request)`

- Route: `POST /api/auth/refresh`.
- Validates that `refreshToken` is present.
- Delegates to `authService.refresh(request)`.
- Returns `200 OK` with a new access token and the same refresh token.
- Failure paths:
  - Invalid payload: `400`.
  - Invalid or expired refresh token: `401`.

#### `logout(RefreshRequest request)`

- Route: `POST /api/auth/logout`.
- Validates that `refreshToken` is present.
- Delegates to `authService.logout(request)`.
- Returns `204 No Content`.
- Deletes the refresh token if present.

## `service`

### `AuthService`

File: `src/main/java/com/oi/app/organoindia/service/AuthService.java`

Dependencies:

- `AuthenticationManager`: verifies login credentials.
- `UserRepository`: checks and saves users.
- `PasswordEncoder`: hashes registration passwords.
- `JwtUtil`: generates access tokens.
- `RefreshTokenService`: creates, validates, and deletes refresh tokens.
- `CustomUserDetailsService`: loads Spring Security `UserDetails`.

#### `login(LoginRequest request)`

- Authenticates credentials using `AuthenticationManager`.
- Loads the authenticated user through `CustomUserDetailsService`.
- Generates a JWT access token with `JwtUtil.generate`.
- Creates a database-backed refresh token with `RefreshTokenService.create`.
- Extracts the first authority from `UserDetails`, defaulting to `ROLE_CUSTOMER` if empty.
- Returns `AuthResponse(accessToken, refreshToken, email, role)`.
- Throws Spring Security exceptions for invalid credentials or disabled accounts.

#### `register(RegisterRequest request)`

- Checks whether the email already exists.
- Throws `IllegalArgumentException("Email already registered")` if the email is taken.
- Creates a new `User`.
- Stores the email, BCrypt-encoded password, `ROLE_CUSTOMER`, and enabled status.
- Saves the user.
- Loads the new user as `UserDetails`.
- Generates an access token.
- Creates a refresh token.
- Returns `AuthResponse` with role `ROLE_CUSTOMER`.

#### `refresh(RefreshRequest request)`

- Validates the incoming refresh token through `RefreshTokenService.validate`.
- Loads the token owner's user details.
- Generates a new access token.
- Extracts the first authority from `UserDetails`, defaulting to `ROLE_CUSTOMER`.
- Returns `AuthResponse(newAccessToken, sameRefreshToken, email, role)`.
- Does not rotate the refresh token.

#### `logout(RefreshRequest request)`

- Calls `RefreshTokenService.deleteByToken`.
- Has no return value.
- Intended to invalidate the refresh token server-side.

### `RefreshTokenService`

File: `src/main/java/com/oi/app/organoindia/service/RefreshTokenService.java`

Dependencies:

- `RefreshTokenRepository`: persists and deletes refresh token entities.
- `UserRepository`: resolves the token owner by email.

Configuration:

- `refreshExpiryDays`: injected from `app.jwt.refresh-expiry-days`, default `7`.

#### `create(String email)`

- Transactional.
- Finds the user by email.
- Throws `UsernameNotFoundException` if the user does not exist.
- Deletes any existing refresh token for the user.
- Creates a new `RefreshToken` with:
  - The resolved user.
  - A random UUID string.
  - Expiry time of `now + refreshExpiryDays * 86400` seconds.
- Saves and returns the token.

#### `validate(String rawToken)`

- Transactional.
- Looks up the refresh token by raw token value.
- Throws `IllegalStateException("Invalid refresh token")` if not found.
- Calls `RefreshToken.isExpired()`.
- If expired:
  - Deletes the token.
  - Throws `IllegalStateException("Refresh token expired, please log in again")`.
- Returns the token if valid.

#### `deleteByToken(String rawToken)`

- Transactional.
- Calls `RefreshTokenRepository.deleteByToken(rawToken)`.
- Used by logout.

### `ProductService`

File: `src/main/java/com/oi/app/organoindia/service/ProductService.java`

#### `deleteProduct(Long id)`

- Annotated with `@PreAuthorize("hasRole('ADMIN')")`.
- Requires method security to be enabled, which is done by `SecurityConfig`.
- Currently has an empty method body.
- The comments in this class show likely future methods for create, update, list, and order placement, but those methods are not implemented.

## `security`

### `CustomUserDetailsService`

File: `src/main/java/com/oi/app/organoindia/security/CustomUserDetailsService.java`

Dependencies:

- `UserRepository`: retrieves users by email.

#### `loadUserByUsername(String email)`

- Finds a `User` by email.
- Throws `UsernameNotFoundException` if absent.
- Converts each `Role` enum to a `SimpleGrantedAuthority` with the enum name.
- Builds and returns Spring Security's `UserDetails`.
- Uses:
  - Username: user email.
  - Password: encoded user password.
  - Authorities: converted roles.
  - Disabled flag: inverse of `user.isEnabled()`.

### `JwtFilter`

File: `src/main/java/com/oi/app/organoindia/security/JwtFilter.java`

Extends: `OncePerRequestFilter`

Dependencies:

- `JwtUtil`: validates and parses JWTs.

#### `doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)`

- Runs once per request.
- Reads the `Authorization` header.
- If the header is missing or does not start with `Bearer `:
  - Continues the filter chain without setting authentication.
- Extracts the token after the `Bearer ` prefix.
- If the token is valid and the security context is empty:
  - Extracts username from JWT subject.
  - Extracts authorities from JWT `roles` claim.
  - Creates a `UsernamePasswordAuthenticationToken`.
  - Adds web authentication details.
  - Stores the authentication in `SecurityContextHolder`.
- Continues the filter chain.

### `JwtUtil`

File: `src/main/java/com/oi/app/organoindia/security/JwtUtil.java`

Configuration:

- `secret`: injected from `app.jwt.secret`; expected to be Base64 encoded.
- `expiryMinutes`: injected from `app.jwt.expiry-minutes`, default `20`.

#### `key()`

- Private helper.
- Base64-decodes `secret`.
- Creates an HMAC `SecretKey` through `Keys.hmacShaKeyFor`.
- Used by all signing and parsing operations.

#### `generate(UserDetails user)`

- Reads authorities from `UserDetails`.
- Converts authorities to role strings.
- Builds a signed JWT containing:
  - Subject: username/email.
  - Claim `roles`: list of authority strings.
  - Issued-at date.
  - Expiration date based on `expiryMinutes`.
- Signs with the configured HMAC key.
- Returns compact JWT string.

#### `extractUsername(String token)`

- Verifies token signature.
- Parses signed claims.
- Returns the JWT subject, which is the user's email.

#### `extractRoles(String token)`

- Verifies token signature.
- Reads the `roles` claim as a list.
- Converts each role string to `SimpleGrantedAuthority`.
- Returns a list of `GrantedAuthority`.

#### `isValid(String token)`

- Attempts to parse and verify signed JWT claims.
- Returns `true` if parsing succeeds.
- Returns `false` for `JwtException` or `IllegalArgumentException`.
- Used by `JwtFilter` before extracting username and roles.

## `exception`

### `GlobalExceptionHandler`

File: `src/main/java/com/oi/app/organoindia/exception/GlobalExceptionHandler.java`

Annotation:

- `@RestControllerAdvice`: applies exception handlers to REST controller execution.

#### `handleBadCredentials(BadCredentialsException ex)`

- Handles wrong email/password login attempts.
- Returns HTTP `401`.
- Body: `{ "status": 401, "message": "Invalid credentials" }`.
- Does not reveal whether email or password was incorrect.

#### `handleDisabled(DisabledException ex)`

- Handles login attempts by disabled users.
- Returns HTTP `403`.
- Body: `{ "status": 403, "message": "Account is disabled" }`.

#### `handleValidation(MethodArgumentNotValidException ex)`

- Handles `@Valid` request body validation failures.
- Collects field errors into a comma-separated string.
- Returns HTTP `400`.
- Body includes `status` and validation `message`.

#### `handleIllegalState(IllegalStateException ex)`

- Handles invalid or expired refresh-token flows.
- Returns HTTP `401`.
- Body includes the exception message.

#### `handleIllegalArg(IllegalArgumentException ex)`

- Handles duplicate registration email.
- Returns HTTP `409`.
- Body includes the exception message.

### `AuthEntryPoint`

File: `src/main/java/com/oi/app/organoindia/exception/AuthEntryPoint.java`

Implements: `AuthenticationEntryPoint`

#### `commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)`

- Runs when a protected endpoint is accessed without valid authentication.
- Sets HTTP status `401`.
- Sets content type to JSON.
- Writes body:

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Missing or invalid token"
}
```

### `CustomAccessDeniedHandler`

File: `src/main/java/com/oi/app/organoindia/exception/CustomAccessDeniedHandler.java`

Implements: `AccessDeniedHandler`

#### `handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException)`

- Runs when authentication exists but lacks the required role.
- Sets HTTP status `403`.
- Sets content type to JSON.
- Writes body:

```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "You do not have permission to access this resource"
}
```

## `model`

### `User`

File: `src/main/java/com/oi/app/organoindia/model/User.java`

- JPA entity mapped to table `USER`.
- Lombok generates getters, setters, and no-arg constructor.
- Fields:
  - `id`: primary key, generated identity column, mapped to `ID`.
  - `firstName`: mapped to `FIRST_NAME`.
  - `lastName`: mapped to `LAST_NAME`.
  - `email`: unique, required, mapped to `EMAIL`.
  - `password`: required, mapped to `PASSWORD`.
  - `enabled`: required, default `true`, mapped to `ENABLED`.
  - `roles`: eager `@ElementCollection` mapped through `USER_ROLES`.
- Relationships:
  - One user can have many role values in `USER_ROLES`.
  - `RefreshToken` references `User` through a one-to-one relationship.

### `RefreshToken`

File: `src/main/java/com/oi/app/organoindia/model/RefreshToken.java`

- JPA entity mapped to table `refresh_tokens`.
- Lombok generates getters, setters, and no-arg constructor.
- Fields:
  - `id`: primary key, generated identity column, mapped to `ID`.
  - `token`: unique, required token string, mapped to `TOKEN`.
  - `expiresAt`: required expiration instant, mapped to `EXPIRES_AT`.
  - `user`: lazy one-to-one relation to `User`, joined on `USER_ID`.

#### `isExpired()`

- Compares current `Instant.now()` with `expiresAt`.
- Returns `true` when the current time is after the expiration instant.

### `Product`

File: `src/main/java/com/oi/app/organoindia/model/Product.java`

- JPA entity named `PRODUCT`.
- Lombok generates getters and setters.
- Fields:
  - `id`: primary key.
  - `name`: mapped to `NAME`.
  - `rate`: `BigDecimal`, mapped to `RATE`.
  - `lastUpdatedTime`: `Timestamp`, mapped to `LAST_UPDATED_TIME`.
- No repository or controller exists for this entity in the current source tree.

### `Role`

File: `src/main/java/com/oi/app/organoindia/model/Role.java`

- Enum values:
  - `ROLE_CUSTOMER`
  - `ROLE_ADMIN`
- Values are stored as strings in `USER_ROLES`.
- Values are used directly as Spring Security authority names.

## `repository`

### `UserRepository`

File: `src/main/java/com/oi/app/organoindia/repository/UserRepository.java`

Extends `JpaRepository<User, Long>`.

#### `findByEmail(String email)`

- Spring Data derived query.
- Returns `Optional<User>`.
- Used by `CustomUserDetailsService`, `RefreshTokenService`, and indirectly auth flows.

#### `existsByEmail(String email)`

- Spring Data derived query.
- Returns `true` if a row exists for the email.
- Used by registration and admin initialization to prevent duplicates.

### `RefreshTokenRepository`

File: `src/main/java/com/oi/app/organoindia/repository/RefreshTokenRepository.java`

Extends `JpaRepository<RefreshToken, Long>`.

#### `findByToken(String token)`

- Spring Data derived query.
- Returns `Optional<RefreshToken>`.
- Used by refresh token validation.

#### `deleteByUser(User user)`

- Spring Data derived delete query.
- Deletes refresh tokens belonging to a user.
- Used before creating a new refresh token so each user has one active refresh token.

#### `deleteByToken(String token)`

- Spring Data derived delete query.
- Deletes a refresh token by raw token value.
- Used by logout.

## `dto`

### `LoginRequest`

File: `src/main/java/com/oi/app/organoindia/dto/LoginRequest.java`

- Java record with generated constructor/accessors.
- Fields:
  - `email`: must be a valid email and not blank.
  - `password`: must not be blank.
- Used by `AuthController.login`.

### `RegisterRequest`

File: `src/main/java/com/oi/app/organoindia/dto/RegisterRequest.java`

- Java record with generated constructor/accessors.
- Fields:
  - `email`: must be a valid email and not blank.
  - `password`: must not be blank and must be at least 8 characters.
- Used by `AuthController.register`.

### `RefreshRequest`

File: `src/main/java/com/oi/app/organoindia/dto/RefreshRequest.java`

- Java record with generated constructor/accessors.
- Fields:
  - `refreshToken`: must not be blank.
- Used by refresh and logout endpoints.

### `AuthResponse`

File: `src/main/java/com/oi/app/organoindia/dto/AuthResponse.java`

- Java record with generated constructor/accessors.
- Fields:
  - `accessToken`: JWT bearer token.
  - `refreshToken`: opaque database-backed refresh token.
  - `email`: authenticated user's email.
  - `role`: first role returned by the user's authorities.

## Tests

### `DataInitializerTest`

File: `src/test/java/com/oi/app/organoindia/config/DataInitializerTest.java`

#### `test()`

- Creates a Mockito mock of `DataInitializer`.
- Injects mocked `UserRepository` and `PasswordEncoder` fields via `ReflectionTestUtils`.
- Configures the mock to call the real `run` method.
- Calls `dataInitializer.run(null)`.
- This test exercises method invocation shape, but because the object is a mock and configuration fields are not populated, it does not currently assert admin creation behavior.

