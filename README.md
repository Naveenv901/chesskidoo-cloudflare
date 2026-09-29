# ChessKidoo Academy

Online management platform for ChessKidoo — INDIA's premier chess academy.
Three portals: Admin, Coach, Student/Parent. Built with Vite + Cloudflare Pages + D1.

## Stack

- **Frontend**: Vite (multi-page), vanilla JS modules, CSS custom properties
- **Hosting**: Cloudflare Pages (static) + Pages Functions (API)
- **Database**: Cloudflare D1 (SQLite)
- **Auth**: Custom JWT + KV sessions
- **Storage**: Cloudflare R2 (optional)

## Quick start

```bash
cp .env.example .env.local   # fill in your values
npm install
npm run dev                  # http://localhost:5173
```

## Environment variables

See `.env.example`. All client-side vars are prefixed `VITE_`.

## Database setup

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Create D1 database
wrangler d1 create chesskidoo-db

# Apply migrations
wrangler d1 migrations apply chesskidoo-db --local
```

## Project structure

```
src/
  lib/          Core utilities (auth, db, router, toast, sanitize)
  pages/        One folder per portal (admin, student, coach, arena, landing)
  components/   Reusable UI components
  styles/       CSS design tokens + per-page stylesheets
functions/
  api/          Cloudflare Pages Functions (replaces Supabase Edge Functions)
    auth.js     Login/register/logout
    users.js    Users CRUD
    classes.js  Classes management
    ...
migrations/     D1 SQL migrations
public/         Static files served as-is (images, favicon, _redirects, _headers)
lms/            Legacy portal (gradually migrating to src/)
```

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # preview production build locally
npm run lint     # ESLint
npm run format   # Prettier
```

## Deploy

```bash
# Push to GitHub - Cloudflare auto-deploys
git push

# Or deploy directly
wrangler pages project deploy
```

## Portals

| Portal  | Route      | Guard         |
|---------|------------|---------------|
| Admin   | /admin     | role: admin   |
| Coach   | /coach     | role: coach   |
| Student | /student   | role: student |
| Arena   | /arena     | authenticated |
| Landing | /          | public        |
| Login   | /login     | public        |
