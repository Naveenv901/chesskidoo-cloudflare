-- Migration: 0002_add_missing_columns

ALTER TABLE users ADD COLUMN updated_at TEXT;
