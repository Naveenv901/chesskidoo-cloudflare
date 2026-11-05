-- Migration: 0008_create_blogs_table.sql
CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY,
  title TEXT,
  excerpt TEXT,
  content TEXT,
  author TEXT,
  image TEXT,
  created_at TEXT,
  updated_at TEXT
);
