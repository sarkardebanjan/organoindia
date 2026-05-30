# Organo India UI

Production-oriented React frontend for the Organo India organic vegetables marketplace.

## Setup

```bash
cd ui
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` in `.env` to your Spring Boot API root, for example:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Scripts

- `npm run dev` starts Vite.
- `npm run build` creates the production build.
- `npm run preview` serves the production build locally.
- `npm audit --audit-level=high` checks for high and critical vulnerabilities.
