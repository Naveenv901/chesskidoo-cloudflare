import { D1Database } from '@cloudflare/d1';

const db = await OPEN_DB;

// Admin user
await db.exec(`
  INSERT OR IGNORE INTO users (id, email, full_name, role, userid) VALUES
  ('a007b0b0-9b30-478f-a147-1af18dff20ce', 'admin@gmail.com', 'Academy Admin', 'admin', 'admin');
  INSERT OR IGNORE INTO credentials (email, password) VALUES
  ('admin@gmail.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9');
`);

// Students - based on cloudflare-students.json data
const students = [
  { id: '08af0678-20ab-4199-ba80-9fc933c779bf', name: 'SAHANA CHESSKIDOO - OFFLINE', batch: '2b47beb1-d68c-4571-b2fe-52b125131985', coach: 'c_jaganathan' },
  { id: '1010d0d5-5e17-4b08-90c6-82e6004d683a', name: 'BALAPRANAV S', batch: '2b47beb1-d68c-4571-b2fe-52b125131985', coach: 'c_jaganathan' },
  { id: '112e5192-2f94-42ed-8893-e2b58af1f2f5', name: 'Mocsha PK', batch: '8076aeeb-8559-40bc-a6c1-e5f883b8ced6', coach: 'c_yogesh' },
  { id: '15e09d45-a23d-4284-9e85-7dadb3849753', name: 'Anved', batch: 'e03079eb-27e4-4cc7-8d58-ce5622b14ecb', coach: 'c_shripathy' },
  { id: '1702b3e1-c776-44b2-a212-5a40e64fe5aa', name: 'Uthiraapiramu', batch: 'a0834c97-bdf2-461b-8004-41c927bcc003', coach: 'c_yogesh' },
];

for (const student of students) {
  await db.exec(`INSERT OR IGNORE INTO users (id, email, full_name, role, userid) VALUES ('${student.id}', '${student.name.toLowerCase().replace(/[^a-z0-9]/g, '.') }@chesskidoo.com', '${student.name}', 'student', '${student.id}')`);
  await db.exec(`INSERT OR IGNORE INTO credentials (email, password) VALUES ('${student.name.toLowerCase().replace(/[^a-z0-9]/g, '.') }@chesskidoo.com', 'hashed_password')`);
}

// Create batches/classes for attendance
await db.exec(`
  INSERT OR IGNORE INTO classes (id, coachId, coachName, title, level, batch, days, time, duration, maxStudents, active) VALUES
  ('class-1', 'c_jaganathan', 'Coach Jagan', 'Beginner Class', 'beginner', '2b47beb1-d68c-4571-b2fe-52b125131985', 'Mon,Wed,Fri', '17:00', 60, 10, 1),
  ('class-2', 'c_yogesh', 'Coach Yogesh', 'Intermediate Class', 'intermediate', '8076aeeb-8559-40bc-a6c1-e5f883b8ced6', 'Tue,Thu,Sat', '17:00', 60, 10, 1)
`);

// Assignments for homework tests
await db.exec(`
  INSERT OR IGNORE INTO assignments (id, title, type, assignedTo, dueDate, description, coach, moves) VALUES
  ('hw-01', 'Mate in 1', 'puzzle', 'batch', '2025-01-15', 'Solve the mate in 1 puzzle', 'Coach Jagan', '1'),
  ('hw-02', 'Tactical Exercise', 'tactical', 'student', '2025-01-20', 'Solve tactical puzzles', 'Coach Jagan', '5'),
  ('hw-03', 'Game Analysis', 'analysis', 'all', '2025-01-25', 'Analyze your last game', 'Coach Jagan', '10')
`);

// HW submissions
await db.exec(`
  INSERT OR IGNORE INTO hw_submissions (id, assignment_id, student_id, accuracy, movesStudied, totalMoves, note, completed, submittedAt) VALUES
  ('sub-01', 'hw-01', '08af0678-20ab-4199-ba80-9fc933c779bf', 80, 3, 5, 'Good study', 1, '2025-01-15T10:00:00'),
  ('sub-02', 'hw-02', '1010d0d5-5e17-4b08-90c6-82e6004d683a', 75, 2, 5, 'Nice try', 1, '2025-01-20T14:30:00')
`);

// Attendance records for attendance tests
const now = new Date();
const yesterday = new Date(now);
yesterday.setDate(yesterday.getDate() - 1);

await db.exec(`
  INSERT OR IGNORE INTO attendance (id, userid, studentId, studentName, classId, className, coachId, coachName, markedAt, date, status, class_title) VALUES
  ('att-01', 'admin', '08af0678-20ab-4199-ba80-9fc933c779bf', 'Sahana', 'class-1', 'Beginner Class', 'c_jaganathan', 'Coach Jagan', '${now.toISOString()}', '${yesterday.toISOString().split('T')[0]}', 'present', 'Beginner Class'),
  ('att-02', 'admin', '1010d0d5-5e17-4b08-90c6-82e6004d683a', 'Balapranav', 'class-1', 'Beginner Class', 'c_jaganathan', 'Coach Jagan', '${now.toISOString()}', '${yesterday.toISOString().split('T')[0]}', 'absent', 'Beginner Class'),
  ('att-03', 'admin', '112e5192-2f94-42ed-8893-e2b58af1f2f5', 'Mocsha', 'class-2', 'Intermediate Class', 'c_yogesh', 'Coach Yogesh', '${now.toISOString()}', '${yesterday.toISOString().split('T')[0]}', 'present', 'Intermediate Class')
`);

console.log('Test data seeded successfully');
console.log('Students: ', students.length);
console.log('Assignments: 3');
console.log('HW Submissions: 2');
console.log('Attendance Records: 3');