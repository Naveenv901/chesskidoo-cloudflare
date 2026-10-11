-- ChessKidoo D1: keep Supabase-compatible columns on `assignments` so the LMS
-- homework UI (built for the Supabase `homework_assignments` schema) keeps working.
-- Applied for the homework re-migration (migrate-homework.mjs).

ALTER TABLE assignments ADD COLUMN target_type TEXT;
ALTER TABLE assignments ADD COLUMN student_id TEXT;
ALTER TABLE assignments ADD COLUMN batch_id TEXT;
ALTER TABLE assignments ADD COLUMN max_marks TEXT;
ALTER TABLE assignments ADD COLUMN status TEXT DEFAULT 'active';
ALTER TABLE assignments ADD COLUMN questions_files TEXT;
