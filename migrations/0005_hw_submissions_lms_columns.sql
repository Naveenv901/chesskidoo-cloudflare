-- ChessKidoo D1: align hw_submissions with the columns the API submit handler
-- (POST /api/homework?action=submit) and the LMS homework UI actually write.
-- Without these, student submissions fail with "no such column".
-- Applied once; ALTER TABLE ADD COLUMN is not idempotent in SQLite - do not re-run.

ALTER TABLE hw_submissions ADD COLUMN submission_text TEXT;
ALTER TABLE hw_submissions ADD COLUMN submission_url TEXT;
ALTER TABLE hw_submissions ADD COLUMN file_urls TEXT;
ALTER TABLE hw_submissions ADD COLUMN status TEXT;
ALTER TABLE hw_submissions ADD COLUMN submitted_at TEXT;
ALTER TABLE hw_submissions ADD COLUMN updated_at TEXT;
