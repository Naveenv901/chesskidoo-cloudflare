-- ChessKidoo D1 Schema (SQLite)
-- Migration: 0001_init

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    userid TEXT,
    email TEXT,
    full_name TEXT,
    role TEXT,
    phone_number TEXT,
    city TEXT,
    level TEXT,
    rating INTEGER DEFAULT 800,
    coach TEXT,
    batch TEXT,
    session TEXT,
    schedule TEXT,
    fee TEXT,
    status TEXT,
    due_date TEXT,
    join_date TEXT,
    age INTEGER,
    grade TEXT,
    puzzle INTEGER DEFAULT 0,
    game INTEGER DEFAULT 0,
    star INTEGER DEFAULT 0,
    photo TEXT,
    certificate TEXT,
    last_note TEXT,
    childEmail TEXT,
    childId TEXT,
    child_id TEXT,
    timetable TEXT,
    revenue TEXT,
    classes INTEGER DEFAULT 0,
    streak_count INTEGER DEFAULT 0,
    streak_last_date TEXT,
    srs_data TEXT,
    auth_id TEXT,
    fide_rating TEXT,
    session_type TEXT,
    payment_status TEXT,
    xp INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    category TEXT,
    description TEXT,
    amount TEXT,
    mode TEXT,
    bill TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE document (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT,
    name TEXT,
    level TEXT,
    coach TEXT,
    link TEXT,
    batch TEXT,
    user_ids TEXT,
    type TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE attendance (
    id TEXT PRIMARY KEY,
    userid TEXT,
    studentId TEXT,
    studentName TEXT,
    classId TEXT,
    className TEXT,
    coachId TEXT,
    coachName TEXT,
    markedAt TEXT,
    date TEXT,
    status TEXT,
    class_title TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX idx_attendance_user_date ON attendance(userid, date);

CREATE TABLE ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    online INTEGER,
    international INTEGER,
    date TEXT DEFAULT (datetime('now'))
);

CREATE TABLE tourRatings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    name TEXT,
    result TEXT,
    change TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE resources (
    id TEXT PRIMARY KEY,
    name TEXT,
    type TEXT,
    level TEXT,
    notes TEXT,
    link TEXT,
    coach TEXT,
    batch TEXT,
    fen TEXT,
    solution TEXT,
    difficulty TEXT,
    category TEXT,
    explanation TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE meetings (
    id TEXT PRIMARY KEY,
    date TEXT,
    time TEXT,
    coach TEXT,
    coachId TEXT,
    coachName TEXT,
    title TEXT,
    batch TEXT,
    duration INTEGER,
    link TEXT,
    notes TEXT,
    type TEXT,
    studentIds TEXT,
    status TEXT,
    liveStartedAt TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    parent_name TEXT,
    child_age TEXT,
    city TEXT,
    status TEXT,
    email TEXT,
    message TEXT,
    source TEXT,
    full_name TEXT,
    age TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE coach_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student TEXT,
    coach TEXT,
    text TEXT,
    date TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE credentials (
    email TEXT PRIMARY KEY,
    password TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE batch_links (
    batch_level TEXT PRIMARY KEY,
    link TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE classes (
    id TEXT PRIMARY KEY,
    coachId TEXT,
    coachName TEXT,
    title TEXT,
    level TEXT,
    batch TEXT,
    days TEXT,
    time TEXT,
    duration INTEGER,
    zoomLink TEXT,
    maxStudents INTEGER DEFAULT 10,
    studentIds TEXT,
    active INTEGER DEFAULT 1,
    createdAt TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE monthly_reports (
    id TEXT PRIMARY KEY,
    studentId TEXT,
    studentName TEXT,
    coachId TEXT,
    coachName TEXT,
    month INTEGER,
    year INTEGER,
    attendance INTEGER,
    puzzles INTEGER,
    notes TEXT,
    recommendation TEXT,
    topics TEXT,
    rating INTEGER,
    type TEXT,
    data TEXT,
    createdAt TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE puzzle_scores (
    id TEXT PRIMARY KEY,
    userId TEXT,
    userName TEXT,
    puzzleId TEXT,
    solved INTEGER,
    time INTEGER,
    mistakes INTEGER,
    xp INTEGER,
    date TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE coach_attendance (
    id TEXT PRIMARY KEY,
    coachId TEXT,
    classId TEXT,
    date TEXT,
    joinedAt TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE assignments (
    id TEXT PRIMARY KEY,
    title TEXT,
    pgn TEXT,
    type TEXT,
    assignedTo TEXT,
    dueDate TEXT,
    description TEXT,
    coach TEXT,
    moves TEXT,
    created INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE hw_submissions (
    id TEXT PRIMARY KEY,
    assignment_id TEXT,
    student_id TEXT,
    accuracy INTEGER,
    movesStudied INTEGER,
    totalMoves INTEGER,
    note TEXT,
    completed INTEGER DEFAULT 0,
    submittedAt TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE feedback (
    id TEXT PRIMARY KEY,
    fromId TEXT,
    fromName TEXT,
    fromRole TEXT,
    childId TEXT,
    childName TEXT,
    toId TEXT,
    toName TEXT,
    message TEXT,
    rating INTEGER,
    category TEXT,
    replied INTEGER DEFAULT 0,
    reply TEXT,
    parent_name TEXT,
    parent_email TEXT,
    student_email TEXT,
    text TEXT,
    status TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE broadcasts (
    id TEXT PRIMARY KEY,
    fen TEXT,
    pgn TEXT,
    coach TEXT,
    ts INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    role TEXT,
    email TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_classes_coach ON classes(coachId);
CREATE INDEX idx_assignments_coach ON assignments(coach);
CREATE INDEX idx_hw_submissions_student ON hw_submissions(student_id);
