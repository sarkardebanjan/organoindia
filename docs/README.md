# Organo India Code Documentation

This documentation describes the current Spring Boot backend in this repository. It is structured for two audiences:

- Humans who need a quick mental model of the project.
- AI models that need stable, explicit descriptions of classes, methods, data flow, and control flow.

## Document Map

- [Project Architecture](./architecture.md): high-level package layout, runtime components, persistence model, and security boundaries.
- [Control Flow And Data Flow](./control-flow.md): request lifecycles, Mermaid sequence diagrams, and major runtime paths.
- [Method Reference](./method-reference.md): class-by-class and method-by-method behavior notes.
- [Mermaid Diagrams](./mermaid-diagrams.md): standalone diagrams for dependency, entity, auth, and startup flows.

## Current Implementation Snapshot

The project is a Java 25 / Spring Boot 4 backend named `organoindia`.

Implemented runtime features:

- Application startup through `OrganoindiaApplication`.
- Stateless Spring Security configuration with JWT bearer-token authentication.
- Auth endpoints under `/api/auth`.
- User registration, login, refresh-token based access-token renewal, and logout.
- Admin user initialization at startup.
- JPA entities for `User`, `RefreshToken`, and `Product`.
- Spring Data JPA repositories for users and refresh tokens.
- JSON error handling for authentication, authorization, validation, and auth service errors.

Configured or partially implemented surfaces:

- `/api/products/**` and `/api/categories/**` GET requests are configured as public.
- Product write operations are configured as admin-only.
- `ProductService.deleteProduct(Long id)` exists with `@PreAuthorize("hasRole('ADMIN')")`, but has an empty implementation.
- There are no concrete product/category controllers in the current source tree.
- Some required properties referenced by auth startup/security code are not present in `application.properties`: `app.jwt.secret`, `app.admin.email`, and `app.admin.password`.

## Main Runtime Story

1. Spring Boot starts the application.
2. `SecurityConfig` creates the stateless security filter chain and registers `JwtFilter`.
3. `DataInitializer` runs once and creates an admin user if configured and missing.
4. Public auth endpoints issue JWT access tokens and database-backed refresh tokens.
5. Protected requests pass through `JwtFilter`.
6. `JwtFilter` validates the bearer JWT, extracts username and roles, and places an authentication object in `SecurityContextHolder`.
7. Spring Security uses the populated security context and configured route rules or method-level annotations to allow or deny access.

