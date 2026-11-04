-- ChessKidoo D1: complete the homework_assignments-compatible column set on
-- `assignments` so LMS homework saves persist every field the UI sends.
--
-- Context: the LMS homework UI (lms/js/homework.js) was built for the Supabase
-- `homework_assignments` table and POSTs snake_case fields. Without these
-- columns POST /api/homework silently dropped coach/files/student scoping,
-- which made coaches' homework disappear from their own views.
--
-- ALTER TABLE ADD COLUMN is NOT idempotent in SQLite - run once only.

ALTER TABLE assignments ADD COLUMN coach_id TEXT;
ALTER TABLE assignments ADD COLUMN created_by TEXT;
ALTER TABLE assignments ADD COLUMN attachment_urls TEXT;
ALTER TABLE assignments ADD COLUMN present_student_ids TEXT;
ALTER TABLE assignments ADD COLUMN updated_at TEXT;
