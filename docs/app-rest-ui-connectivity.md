# App REST ↔ UI Connectivity and Deployment Analysis

Date: 2026-05-31

## Summary

- This project is designed to be built and deployed as a single Spring Boot executable JAR that serves both the REST API (under `/api`) and the React UI static assets (served from Spring Boot's `/static` resource location).
- Security: stateless JWT bearer-token authentication is implemented via `SecurityConfig` and `JwtFilter`. CSRF is disabled (correct for stateless JWT). Defensive headers (HSTS, CSP, frameOptions) are enabled.
- Development: the React dev server (`vite`) proxies `/api` to `http://localhost:8080` to avoid CORS during development. In production the UI and API are same-origin so no CORS is required.

## Current implementation (key files)

- Server security: [src/main/java/com/oi/app/organoindia/config/SecurityConfig.java](src/main/java/com/oi/app/organoindia/config/SecurityConfig.java)
  - Builds a `SecurityFilterChain` (JWT filter added before auth filter)
  - Disables CSRF, sets stateless session policy, configures route rules, and enables HSTS + CSP
  - Note: no explicit CORS configuration is present in `SecurityConfig`

- JWT processing: [src/main/java/com/oi/app/organoindia/security/JwtFilter.java](src/main/java/com/oi/app/organoindia/security/JwtFilter.java)
  - Reads `Authorization: Bearer <token>` header, validates token, and populates Spring Security context when valid

- API base path and properties: [src/main/resources/application.properties](src/main/resources/application.properties)
  - `spring.data.rest.basePath=/api` (API endpoints live under `/api`)
  - JWT secret and admin credentials are environment-driven: `APP_JWT_SECRET`, `APP_ADMIN_EMAIL`, `APP_ADMIN_PASSWORD`

- React client:
  - base URL: `ui/src/api/axiosInstance.js` — `baseURL = import.meta.env.VITE_API_BASE_URL || '/api'` (defaults to `/api` so client expects same-origin API in production)
  - token handling: client uses Authorization header `Bearer <accessToken>` and automatic refresh via `/api/auth/refresh`
  - dev proxy: `ui/vite.config.js` proxies `/api` -> `http://localhost:8080`

- Build integration: `build.gradle` defines `npmCi` and `buildUi` tasks and copies `ui/dist` into the Spring Boot `static` directory during `processResources`. `./gradlew bootJar` produces a jar that contains the built UI under `/static`.

## Runtime flow (typical request lifecycle)

1. Browser requests site root `/` → Spring Boot serves `index.html` (from `/static`) and JS/CSS assets.
2. React app issues API calls to `/api/...` (same origin) via `axios` instance with `Authorization` header when logged in.
3. Spring Boot receives request at `/api/...`:
   - `JwtFilter` inspects `Authorization` header, validates JWT, and sets authentication in `SecurityContextHolder`.
   - Security rules in `SecurityConfig` apply (permit/require roles or authentication per route).
4. For 401 responses the client interceptor attempts token refresh (`/api/auth/refresh`) and retries the failed request.

## CORS and same-origin behavior

- Production: because the UI is embedded into the Spring Boot jar and served from the same origin as the API (`/api`), no CORS configuration is required for normal browser API calls.
- Development: the Vite dev server proxies `/api` to the backend at `http://localhost:8080`, avoiding CORS during development. This is already configured in `ui/vite.config.js`.
- If you later decide to host UI on a different host/origin (separate CDN or S3), you must enable CORS server-side. Options:
  - Add CORS mapping with `WebMvcConfigurer` or via `HttpSecurity.cors(...)` plus a `CorsConfigurationSource` bean.
  - Restrict allowed origins to your UI origin(s) and allow the required methods/headers.

## TLS / secure connection handling

- The application currently sets HSTS in `SecurityConfig`, but it does not terminate TLS itself. TLS must be provided externally (recommended) or configured inside Spring Boot.
- Recommended production setup: terminate TLS at a reverse proxy (nginx, Caddy, Traefik) and have that proxy forward to the Spring Boot app over HTTP (localhost or private network). Reasons:
  - Easier certificate management (Let's Encrypt, automatic renewals)
  - Better logging, request buffering, and static file caching control
  - Ability to scale and route to multiple app instances behind the proxy

Example nginx server block (TLS termination + proxying to app on 127.0.0.1:8080):

```
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $server_name;
    }
}
```

- When behind a proxy, enable `server.use-forward-headers=true` (Spring Boot) or register `ForwardedHeaderFilter` so Spring Security/HSTS/etc. see the original scheme and host.

Alternative: enable SSL inside Spring Boot using `server.ssl.*` properties and a keystore — this is feasible but less flexible than using a dedicated reverse proxy.

## Recommended build & run process (single JAR serving both UI and API)

1. Ensure required environment variables are set (production values):
   - `APP_JWT_SECRET` (a strong secret)
   - `APP_ADMIN_EMAIL`, `APP_ADMIN_PASSWORD`
   - DB connection environment variables or modify `application.properties` as appropriate

2. Build the app (this will run the UI build and copy `ui/dist` into `static`):

```bash
./gradlew clean bootJar
```

3. Start the jar (example: run as dedicated user, in background or systemd):

```bash
java -jar build/libs/organoindia-1.0.jar --spring.profiles.active=prod
```

4. (Recommended) Run behind nginx/Caddy/Traefik with TLS termination and configure systemd:

Example systemd unit (`/etc/systemd/system/organoindia.service`):

```
[Unit]
Description=Organoindia Spring Boot App
After=network.target

[Service]
User=organo
WorkingDirectory=/opt/organoindia
ExecStart=/usr/bin/java -jar /opt/organoindia/organoindia-1.0.jar --spring.profiles.active=prod
Restart=on-failure
Environment=APP_JWT_SECRET=... 
Environment=APP_ADMIN_EMAIL=... 
Environment=APP_ADMIN_PASSWORD=...

[Install]
WantedBy=multi-user.target
```

## Additional recommendations and notes

- Keep `APP_JWT_SECRET` secret and rotate if needed. Use a proper secret manager (Vault, cloud KMS) in production.
- CSP: `SecurityConfig` sets `connect-src 'self'` — if you add third-party APIs/analytics you must expand CSP accordingly.
- If you plan to serve UI from a different origin (CDN, S3), add server-side CORS and update `VITE_API_BASE_URL` accordingly at build time.
- Logging: ensure your reverse proxy forwards client IPs (`X-Forwarded-For`) and configure app logging to consume them if you need accurate client IPs.
- Health checks & readiness: add endpoints for health/readiness and configure the reverse proxy / orchestrator to use them.

## Quick checklist before production deploy

- [ ] Set `APP_JWT_SECRET`, `APP_ADMIN_EMAIL`, `APP_ADMIN_PASSWORD` in environment or secret manager
- [ ] Confirm DB connection settings and network access
- [ ] Run `./gradlew clean bootJar` and verify `ui/dist` files are included in `build/resources/main/static`
- [ ] Configure TLS termination (nginx/Caddy) and enable `server.use-forward-headers=true`
- [ ] Create systemd unit / container spec and monitoring/log rotation

---

If you want, I can:
- produce an example `nginx` config file with Let's Encrypt automation for your domain, or
- add a `CorsConfigurationSource` bean and an example `ForwardedHeaderFilter`/`application.properties` snippet to the codebase.
