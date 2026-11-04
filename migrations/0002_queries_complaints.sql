-- ChessKidoo D1 Schema - Queries, Complaints & Registrations
-- Migration: 0002_queries_complaints

-- Messages table (referenced in ALLOWED_TABLES but missing from initial schema)
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT,
    receiver_id TEXT,
    subject TEXT,
    body TEXT,
    category TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_category ON messages(category);

-- Complaints & Feedback
CREATE TABLE IF NOT EXISTS complaint_feedback (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    category TEXT NOT NULL,           -- 'complaint', 'feedback', 'suggestion', 'query'
    rating INTEGER,                   -- 1-5 for feedback
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',    -- 'pending', 'in_progress', 'resolved', 'closed'
    admin_notes TEXT,
    assigned_to TEXT,                 -- coach/admin ID
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_complaint_status ON complaint_feedback(status);
CREATE INDEX IF NOT EXISTS idx_complaint_category ON complaint_feedback(category);
CREATE INDEX IF NOT EXISTS idx_complaint_created ON complaint_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaint_contact ON complaint_feedback(contact);

-- Student Registration Queries
CREATE TABLE IF NOT EXISTS registration_queries (
    id TEXT PRIMARY KEY,
    parent_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    child_name TEXT,
    child_age INTEGER,
    city TEXT,
    country TEXT,
    preferred_mode TEXT,              -- 'online', 'offline', 'both'
    preferred_slot TEXT,
    level TEXT,                       -- 'beginner', 'intermediate', 'advanced'
    message TEXT,
    status TEXT DEFAULT 'new',        -- 'new', 'contacted', 'demo_booked', 'enrolled', 'closed'
    source TEXT DEFAULT 'website',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_reg_status ON registration_queries(status);
CREATE INDEX IF NOT EXISTS idx_reg_created ON registration_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reg_phone ON registration_queries(phone);