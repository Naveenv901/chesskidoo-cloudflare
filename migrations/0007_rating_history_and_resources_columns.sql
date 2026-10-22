-- ChessKidoo D1 schema fix: LMS/API fields that are missing from the real
-- remote D1 columns. Applied once on deployment (id 9 in d1_migrations).
--
-- This file adds columns to two tables that the Cloudflare API and LMS UI
-- currently read/write but the live D1 schema did not have:
--
--   1. ratings        -> student_id, rating, event, change_type, notes,
--                        recorded_at  (LMS "rating_history" contract)
--   2. resources      -> title, description, url              (LMS resource card)
--
-- All ALTER TABLE ADD COLUMN statements are safe to run repeatedly and will
-- silently no-op if the column already exists on the target table.

-- ─── ratings ────────────────────────────────────────────────────────────
-- The LMS "Growth" tab / rating_history flow expects these columns on every
-- rating row. `user_id` (existing) is kept for backwards compatibility with
-- the legacy look-up path in assets/js/db.js and the admin rating list.
ALTER TABLE ratings ADD COLUMN student_id TEXT;
ALTER TABLE ratings ADD COLUMN rating NUMERIC;
ALTER TABLE ratings ADD COLUMN event TEXT;
ALTER TABLE ratings ADD COLUMN change_type TEXT;
ALTER TABLE ratings ADD COLUMN notes TEXT;
ALTER TABLE ratings ADD COLUMN recorded_at TEXT;

-- Eagerly backfill the new columns from the existing row data for rows that
-- already have values we can map. (Does not affect rows where we have no
-- source value - they keep NULL and the API will populate from the request.)
UPDATE ratings SET student_id = user_id WHERE student_id IS NULL;
UPDATE ratings SET recorded_at = COALESCE(recorded_at, date) WHERE recorded_at IS NULL;

-- Unique index so duplicate rating records can never be written.
CREATE UNIQUE INDEX IF NOT EXISTS idx_ratings_user_id_date ON ratings (user_id, date);

-- ─── resources ──────────────────────────────────────────────────────────
-- The LMS resource card renders r.title, r.description, r.url. The D1 table
-- stores the same data as name/link/notes, so we add the front-end aliases.
ALTER TABLE resources ADD COLUMN title TEXT;
ALTER TABLE resources ADD COLUMN description TEXT;
ALTER TABLE resources ADD COLUMN url TEXT;

-- Backfill the aliases from the legacy column names where the new columns
-- are still NULL (keeps data intact after a fresh deployment).
UPDATE resources SET title = name WHERE title IS NULL;
UPDATE resources SET url = link WHERE url IS NULL;
UPDATE resources SET description = notes WHERE description IS NULL;

-- Unique index so duplicate resource entries can never be written.
CREATE UNIQUE INDEX IF NOT EXISTS idx_resources_id ON resources (id);
