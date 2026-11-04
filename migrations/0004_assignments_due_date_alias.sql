-- ChessKidoo D1: snake_case alias so the LMS homework UI (Supabase schema) can
-- read the due date. Added during the homework re-migration.

ALTER TABLE assignments ADD COLUMN due_date TEXT;
