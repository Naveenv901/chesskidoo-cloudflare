# ChessKidoo — Cloudflare Migration Guide

This guide walks you through migrating ChessKidoo from Supabase to Cloudflare.

## What Changed

| Component | Before (Supabase) | After (Cloudflare) |
|---|---|---|
| **Hosting** | Vercel | Cloudflare Pages |
| **Database** | Supabase Postgres | Cloudflare D1 (SQLite) |
| **Auth** | Supabase Auth | Custom JWT + KV sessions |
| **API** | Supabase Edge Functions + local `api/` | Cloudflare Pages Functions |
| **Client SDK** | `@supabase/supabase-js` | Native `fetch()` |

## Prerequisites

1. Node.js >= 18
2. Wrangler CLI: `npm install -g wrangler`
3. Cloudflare account (free tier works)

## Step 1: Create Cloudflare Resources

```bash
wrangler login

# Create D1 database
wrangler d1 create chesskidoo-db

# Create KV namespace for sessions
wrangler kv namespace create SESSIONS

# Create R2 bucket for uploads (optional)
wrangler r2 bucket create chesskidoo-uploads
```

## Step 2: Configure wrangler.toml

Edit `wrangler.toml` and replace the placeholder IDs with the real ones from the commands above:

```toml
[[d1_databases]]
binding = "DB"
database_name = "chesskidoo-db"
database_id = "REPLACE_WITH_REAL_ID"

[[kv_namespaces]]
binding = "SESSIONS"
id = "REPLACE_WITH_REAL_ID"
```

## Step 3: Apply Database Migrations

```bash
# Apply locally for dev
wrangler d1 migrations apply chesskidoo-db --local

# Apply to production
wrangler d1 migrations apply chesskidoo-db --remote
```

## Step 4: Seed Initial Data

```bash
# Use the D1 CLI to seed admin/coaches
wrangler d1 execute chesskidoo-db --local --file=migrations/seed.sql
```

Create `migrations/seed.sql`:

```sql
INSERT OR IGNORE INTO users (id, email, full_name, role, userid) VALUES
  ('a007b0b0-9b30-478f-a147-1af18dff20ce', 'admin@gmail.com', 'Academy Admin', 'admin', 'admin');

INSERT OR IGNORE INTO credentials (email, password) VALUES
  ('admin@gmail.com', '<SHA256_HASH_OF_admin123>');
```

## Step 5: Set Environment Variables

In Cloudflare Dashboard → Pages → Your Project → Settings → Environment Variables:

| Variable | Value | Type |
|---|---|---|
| `VITE_ACADEMY_NAME` | `ChessKidoo Academy` | Production |
| `VITE_ACADEMY_EMAIL` | `Chesskidoo37@gmail.com` | Production |
| `VITE_ADMIN_UUID` | `a007b0b0-9b30-478f-a147-1af18dff20ce` | Production |

## Step 6: Deploy

```bash
# Push to GitHub - Cloudflare auto-deploys
git push

# Or deploy directly
wrangler pages project deploy
```

## Step 7: Migrate LMS Portal

The `lms/` portal uses `window.supabaseClient` extensively. We've created a compatibility layer in `lms/js/config.js` that maps Supabase calls to our API.

**Critical files updated:**
- `lms/js/config.js` — Compatibility client
- `lms/js/auth.js` — Uses `/api/auth/login` endpoint
- `src/lib/auth.js` — Uses new API client
- `src/lib/api.js` — Thin fetch wrappers

**Files that still need migration (use `window.apiCall` instead of `window.supabaseClient`):**
- `lms/js/scripts.js` — Direct Supabase queries
- `lms/js/coach.js` — Direct Supabase queries
- `lms/js/student.js` — Direct Supabase queries
- `lms/js/admin.js` — Direct Supabase queries
- `lms/js/homework.js` — Direct Supabase storage
- `lms/js/elibrary.js` — Direct Supabase queries

## Step 8: Test

1. Open the site in incognito window
2. Log in as admin: `admin@gmail.com` / `admin123`
3. Verify data persists across page reloads
4. Check Cloudflare Pages Functions logs for errors

## Troubleshooting

**D1 queries failing?**
- Check the table/column names match the schema in `migrations/0001_init.sql`
- D1 is case-insensitive for column names, but we use camelCase in the schema

**Auth not working?**
- Verify the `sessions` table exists
- Check that the token is being sent in the `Authorization` header

**CORS errors?**
- Ensure `_headers` file is in `public/` and being served
- Check that the Cloudflare Function returns proper CORS headers

## Next Steps

1. Migrate remaining `lms/` Supabase calls to use `window.apiCall`
2. Add proper RLS-like authorization in the API layer
3. Set up Cloudflare D1 backups
4. Migrate file uploads from Supabase Storage to R2
5. Add rate limiting to public endpoints
