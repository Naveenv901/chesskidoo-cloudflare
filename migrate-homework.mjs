/**
 * ChessKidoo — Re-migrate homework data from Supabase to Cloudflare D1.
 *
 * Why this exists
 * ---------------
 * The original migration (migrate-to-d1.js) ran with the ANON (publishable) key,
 * so any table protected by RLS exported as `[]`. Worse, export-supabase-service.mjs
 * never listed `homework_assignments` — the table the coach portal actually writes
 * homework to — so coach-assigned homework was never exported at all. D1's
 * `assignments` table (the D1 alias for Supabase `homework_assignments`) is
 * therefore empty.
 *
 * What this does
 * --------------
 * 1. Exports `homework_assignments`, `hw_submissions` (+ `homework_submissions`
 *    if it exists) and `assignments` from Supabase using the SERVICE ROLE key
 *    (bypasses RLS). Also pulls `students`/`coaches` id maps to resolve
 *    batch targets and coach names.
 * 2. Maps every row onto the D1 schema:
 *      assignments(id, title, pgn, type, assignedTo, dueDate, description,
 *                  coach, moves, created, created_at)
 *      hw_submissions(id, assignment_id, student_id, accuracy, movesStudied,
 *                     totalMoves, note, completed, submittedAt, created_at)
 * 3. Writes an idempotent `INSERT OR IGNORE` SQL file to migrations/migrate_homework.sql.
 *
 * Usage
 * -----
 *   node migrate-homework.mjs                     # prompts for the service_role key
 *   node migrate-homework.mjs sb_secret_...       # or pass it directly
 *   $env:SUPABASE_SERVICE_KEY = "sb_secret_..."; node migrate-homework.mjs   (PowerShell)
 *
 *   Offline mode (no API key — dumps pulled from the Supabase SQL editor):
 *   node migrate-homework.mjs --json supabase-export-full
 *   Place in that folder: homework_assignments.json/.csv, hw_submissions.json/.csv,
 *   and optionally students.json/.csv (id,name,email,batch_id) to resolve batch targets.
 *
 * Then import:
 *   wrangler d1 execute chesskidoo-db --remote --file=migrations/migrate_homework.sql
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createInterface } from 'readline';

const SUPABASE_URL = 'https://vseombfkrvpffnpgbsnk.supabase.co';
const EXPORT_DIR = 'supabase-export-full';
// Kept OUT of migrations/ on purpose: wrangler tracks every file in migrations/ and
// would re-execute this data import on every future `migrations apply`.
const SQL_OUT = 'migrate_homework_data.sql';
const PAGE_SIZE = 1000;

const ASSIGNMENT_COLUMNS = ['id', 'title', 'pgn', 'type', 'assignedTo', 'dueDate', 'due_date', 'description', 'coach', 'moves', 'created', 'created_at', 'target_type', 'student_id', 'batch_id', 'max_marks', 'status', 'questions_files'];
const SUBMISSION_COLUMNS = ['id', 'assignment_id', 'student_id', 'accuracy', 'movesStudied', 'totalMoves', 'note', 'completed', 'submittedAt', 'created_at'];
// Columns added by migrations/0003 + 0004; backfilled only when still NULL so a re-run
// can never overwrite values edited in the live app.
const BACKFILL_COLUMNS = ['target_type', 'student_id', 'batch_id', 'max_marks', 'status', 'questions_files', 'due_date'];

/* ── args ── */

const ARGS = process.argv.slice(2);
const JSON_DIR_IDX = ARGS.indexOf('--json');
const JSON_DIR = JSON_DIR_IDX > -1 ? ARGS[JSON_DIR_IDX + 1] : null;
const CLI_KEY = (JSON_DIR_IDX > -1
  ? ARGS.filter((a, i) => i !== JSON_DIR_IDX && i !== JSON_DIR_IDX + 1)
  : ARGS
).find((a) => !a.startsWith('--')) || null;

const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  CLI_KEY;

async function promptForKey() {
  if (SERVICE_KEY || !process.stdin.isTTY) return;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await new Promise((resolve) => rl.question('Service role key (paste then Enter): ', resolve));
    if (answer && answer.trim()) process.env.SUPABASE_SERVICE_KEY = answer.trim();
  } finally {
    rl.close();
  }
}

if (!JSON_DIR) await promptForKey();

const KEY = SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!JSON_DIR && !KEY) {
  console.error('Missing service role key.');
  console.error('Run:  node migrate-homework.mjs   and paste the key when prompted');
  console.error('or:   node migrate-homework.mjs sb_secret_...');
  console.error('or:   $env:SUPABASE_SERVICE_KEY = "sb_secret_..."; node migrate-homework.mjs   (PowerShell)');
  console.error('or:   node migrate-homework.mjs --json supabase-export-full   (offline, key not needed)');
  console.error('Get a key from: https://supabase.com/dashboard/project/vseombfkrvpffnpgbsnk/settings/api');
  process.exit(1);
}

if (!JSON_DIR && KEY && !KEY.startsWith('sb_secret_') && !KEY.startsWith('eyJ')) {
  console.warn('Warning: that does not look like a service_role key (expected sb_secret_... or the legacy JWT).');
  console.warn('The anon/publishable key (sb_publishable_...) returns 200 with [] under RLS — and a revoked legacy JWT gives HTTP 401.');
}

/* ── Supabase REST helper ── */

async function api(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      Accept: 'application/json',
      Prefer: 'count=exact'
    }
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`HTTP ${res.status}: ${body.slice(0, 200) || res.statusText}`);
    err.notFound = res.status === 404 || res.status === 400;
    throw err;
  }

  return res.json();
}

async function exportTable(table, { select = '*' } = {}) {
  const all = [];
  let offset = 0;
  while (true) {
    const path = `${table}?select=${select}&limit=${PAGE_SIZE}&offset=${offset}`;
    const rows = await api(path);
    if (!Array.isArray(rows)) break;
    all.push(...rows);
    if (rows.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return all;
}

/* ── value normalisation ── */

const toStr = (v) => (v === undefined || v === null ? null : String(v));
const toInt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};
const toBoolInt = (v) => (v === true || v === 1 || v === '1' || v === 'true' ? 1 : 0);

function toIso(v) {
  if (v === undefined || v === null || v === '') return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? toStr(v) : d.toISOString();
}

function toEpochMs(v) {
  if (v === undefined || v === null || v === '') return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.getTime();
}

/** Accepts an array, a JSON-array string, a comma string or a scalar → string[] */
function toIdArray(v) {
  if (v === undefined || v === null || v === '') return [];
  let val = v;
  if (typeof val === 'string') {
    const t = val.trim();
    if (t.startsWith('[')) {
      try { val = JSON.parse(t); } catch { val = t.replace(/^\[|\]$/g, '').split(','); }
    } else if (t.startsWith('{') && t.endsWith('}') && t.includes(',')) {
      val = t.replace(/^\{|\}$/g, '').split(','); // Postgres array text: {a,b}
    } else if (t.includes(',')) {
      val = t.split(',');
    } else {
      val = [t];
    }
  }
  const arr = Array.isArray(val) ? val : [val];
  return arr.map((x) => String(x).trim()).filter(Boolean);
}

function appendNote(desc, extra) {
  if (!extra) return desc || '';
  const suffix = typeof extra === 'string' ? extra : JSON.stringify(extra);
  return [desc || '', suffix].filter(Boolean).join('\n');
}

/** Keep plain dates (YYYY-MM-DD) as-is; normalise timestamps to ISO. */
function toDateField(v) {
  if (v === undefined || v === null || v === '') return null;
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return toIso(s) || s;
}

/* ── mapping: Supabase homework_assignments → D1 assignments ── */

function mapHomeWorkAssignment(row, ctx) {
  const students = ctx.students;
  const coachNames = ctx.coachNames;

  // Target list
  let assignedTo = toIdArray(row.assignedTo || row.assigned_to || row.present_student_ids);
  const targetType = toStr(row.target_type) || '';
  const batchKey = row.batch_id === undefined || row.batch_id === null ? '' : String(row.batch_id);

  if (targetType === 'all' || targetType === 'everyone') {
    assignedTo = ['all'];
  } else if (targetType === 'student' && row.student_id) {
    if (!assignedTo.includes(String(row.student_id))) assignedTo.push(String(row.student_id));
  } else if (targetType === 'batch' && batchKey) {
    // Batch membership lives in batches.student_ids; students.batch_id is a fallback.
    const fromBatches = ctx.batchStudents[batchKey] || [];
    const fromStudents = students.filter((s) => String(s.batch_id) === batchKey).map((s) => String(s.id));
    const inBatch = fromBatches.length ? fromBatches : fromStudents;
    assignedTo = assignedTo.length ? assignedTo : inBatch;
  } else if (row.student_id) {
    if (!assignedTo.includes(String(row.student_id))) assignedTo.push(String(row.student_id));
  }

  let resolved = true;
  if (assignedTo.length === 0) {
    // Nothing resolvable (no student_id, and batch→students map unavailable).
    // Fall back to 'all' so the homework is still visible; flagged in the summary.
    assignedTo = ['all'];
    resolved = false;
  }

  const coachId = toStr(row.coach_id || row.coach || row.created_by) || '';
  const coachName = (coachId && coachNames[coachId]) || coachId || '';

  // Attachment URLs had no D1 column — keep them inside the description.
  const attachments = toIdArray(row.attachment_urls || row.questions_files || row.files || row.attachments);

  let description = appendNote(toStr(row.description), attachments.length ? `Attachments:\n${attachments.join('\n')}` : '');
  if (row.max_marks !== undefined && row.max_marks !== null && String(row.max_marks) !== '') {
    description = appendNote(description, `Max marks: ${toStr(row.max_marks)}`);
  }

  return {
    id: toStr(row.id) || `asn-${Math.random().toString(36).slice(2, 10)}`,
    title: toStr(row.title) || 'Untitled homework',
    pgn: toStr(row.pgn) || null,
    type: toStr(row.type) || 'homework',
    assignedTo: JSON.stringify(assignedTo),
    dueDate: toDateField(row.due_date || row.dueDate),
    due_date: toDateField(row.due_date || row.dueDate),
    description,
    coach: coachName,
    moves: toInt(row.moves),
    created: toEpochMs(row.created_at || row.createdAt || row.created) || Date.now(),
    created_at: toIso(row.created_at || row.createdAt) || new Date().toISOString(),
    // Supabase-compatible columns kept for the LMS homework UI (added to D1 by this migration)
    target_type: toStr(row.target_type) || null,
    student_id: toStr(row.student_id) || null,
    batch_id: toStr(row.batch_id) || null,
    max_marks: toStr(row.max_marks) || null,
    status: toStr(row.status) || 'active',
    questions_files: toStr(row.questions_files) || null,
    _resolved: resolved
  };
}

/* ── mapping: Supabase assignments (legacy classroom homework) → D1 assignments ── */

function mapLegacyAssignment(row) {
  let assignedTo = toIdArray(row.assignedTo || row.assigned_to);
  if (!assignedTo.length) assignedTo = ['all'];
  const attachments = toIdArray(row.attachments || row.attachment_urls);
  const dueDate = toDateField(row.dueDate || row.due_date);
  return {
    id: toStr(row.id) || `asn-${Math.random().toString(36).slice(2, 10)}`,
    title: toStr(row.title) || 'Untitled homework',
    pgn: toStr(row.pgn) || null,
    type: toStr(row.type) || 'study',
    assignedTo: JSON.stringify(assignedTo),
    dueDate,
    due_date: dueDate,
    description: appendNote(toStr(row.description), attachments.length ? `Attachments:\n${attachments.join('\n')}` : ''),
    coach: toStr(row.coach) || '',
    moves: toInt(row.moves),
    created: toEpochMs(row.created || row.created_at || row.createdAt) || Date.now(),
    created_at: toIso(row.created_at || row.createdAt) || new Date().toISOString(),
    // Match the compat defaults so a status filter does not hide legacy rows.
    target_type: toStr(row.target_type) || 'legacy',
    student_id: toStr(row.student_id) || null,
    batch_id: toStr(row.batch_id) || null,
    max_marks: toStr(row.max_marks) || null,
    status: toStr(row.status) || 'active',
    questions_files: toStr(row.questions_files) || null
  };
}

/* ── mapping: hw_submissions → D1 hw_submissions ── */

function mapSubmission(row, idx) {
  const id = toStr(row.id) || `sub-migrated-${idx}`;
  const note = appendNote(toStr(row.note), row.files || row.file_urls ? `Files:\n${toIdArray(row.files || row.file_urls).join('\n')}` : '');
  return {
    id,
    assignment_id: toStr(row.assignment_id || row.assignmentId),
    student_id: toStr(row.student_id || row.studentId),
    accuracy: toInt(row.accuracy),
    movesStudied: toInt(row.movesStudied ?? row.moves_studied),
    totalMoves: toInt(row.totalMoves ?? row.total_moves),
    note: note || '',
    completed: toBoolInt(row.completed ?? true),
    submittedAt: toIso(row.submittedAt || row.submitted_at || row.created_at) || new Date().toISOString(),
    created_at: toIso(row.created_at || row.createdAt) || new Date().toISOString()
  };
}

/* ── SQL generation ── */

function sqlValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return Number.isFinite(val) ? String(val) : 'NULL';
  const s = String(val).replace(/'/g, "''"); // SQLite string literals may span lines
  return `'${s}'`;
}

function insertStatements(table, columns, rows, chunk = 40) {
  const colList = columns.join(', ');
  const out = [];
  for (let i = 0; i < rows.length; i += chunk) {
    const slice = rows.slice(i, i + chunk);
    const values = slice.map((r) => `(${columns.map((c) => sqlValue(r[c])).join(', ')})`).join(',\n  ');
    out.push(`INSERT OR IGNORE INTO ${table} (${colList}) VALUES\n  ${values};`);
  }
  return out;
}

/* ── offline mode: read JSON dumps instead of calling the REST API ── */

/** Minimal RFC-4180 CSV parser (handles quoted fields, embedded commas/newlines). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
      continue;
    }
    if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }

  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj = {};
    header.forEach((h, i) => {
      const v = r[i];
      if (v === undefined || v === '') return;
      obj[h] = v;
    });
    return obj;
  });
}

function loadLocalTable(name) {
  if (!JSON_DIR) return null;
  // Accepts dashboard CSV downloads (<table>_rows.csv) and plain <table>.json/.csv.
  // Several formats may exist (e.g. a stale empty [] from a failed API export) —
  // use whichever holds the most rows.
  const candidates = [
    join(JSON_DIR, `${name}.csv`),
    join(JSON_DIR, `${name}_rows.csv`),
    join(JSON_DIR, `${name}.json`),
    join(JSON_DIR, `${name}_rows.json`)
  ].filter((f) => existsSync(f));

  let best = null;
  for (const file of candidates) {
    const asCsv = file.endsWith('.csv');
    try {
      const raw = readFileSync(file, 'utf8');
      let data = asCsv ? parseCsv(raw) : JSON.parse(raw);
      if (!Array.isArray(data) && Array.isArray(data && data.data)) data = data.data;
      if (!Array.isArray(data)) continue;
      if (!best || data.length > best.rows.length) best = { file, rows: data };
    } catch (e) {
      console.log(`  ! ${file}: ${e.message}`);
    }
  }
  if (!best) return null;
  if (candidates.length > 1) console.log(`  (${name}: using ${best.file.split(/[\\/]/).pop()}, ${candidates.length} file(s) found)`);
  return best.rows;
}

const tbl = (name, opts) =>
  exportTable(name, opts).catch((e) => {
    console.log(`  ! ${name}: ${String(e.message).split('\n')[0]} — treating as empty`);
    return [];
  });

async function loadTable(name, opts) {
  if (JSON_DIR) {
    const rows = loadLocalTable(name);
    console.log(`  ${name}: ${rows ? rows.length : 'no local file'} (from ${JSON_DIR})`);
    return rows || [];
  }
  return tbl(name, opts);
}

/* ── main ── */

async function main() {
  if (JSON_DIR) {
    console.log(`Using local JSON dumps from ${JSON_DIR} (no Supabase calls)\n`);
  } else {
    mkdirSync(EXPORT_DIR, { recursive: true });
    console.log('Exporting from Supabase (service role key)...\n');
  }

  const homework = await loadTable('homework_assignments');
  console.log(`  homework_assignments: ${homework.length} rows`);

  const submissionsA = await loadTable('hw_submissions');
  const submissionsB = await loadTable('homework_submissions');
  const submissions = [...submissionsA];
  for (const s of submissionsB) {
    if (!submissions.some((x) => String(x.id) === String(s.id))) submissions.push(s);
  }
  console.log(`  hw_submissions: ${submissions.length} rows (+${submissionsB.length} in homework_submissions)`);

  const legacyAssignments = await loadTable('assignments');

  // Reference data used only to resolve batch → students and coach names.
  const students = await loadTable('students', { select: 'id,name,email,batch_id' });
  const coaches = await loadTable('coaches', { select: 'id,name,email' });
  const batches = await loadTable('batches');
  console.log(`  students: ${students.length}  coaches: ${coaches.length}  batches: ${batches.length}`);

  if (!JSON_DIR) {
    writeFileSync(`${EXPORT_DIR}/homework_assignments.json`, JSON.stringify(homework, null, 2));
    writeFileSync(`${EXPORT_DIR}/hw_submissions.json`, JSON.stringify(submissions, null, 2));
    if (legacyAssignments.length) writeFileSync(`${EXPORT_DIR}/assignments.json`, JSON.stringify(legacyAssignments, null, 2));
  }

  if (homework.length) console.log(`\nhomework_assignments columns:\n  ${Object.keys(homework[0]).join(', ')}`);
  if (submissions.length) console.log(`hw_submissions columns:\n  ${Object.keys(submissions[0]).join(', ')}`);

  const ctx = {
    students,
    coachNames: Object.fromEntries(coaches.map((c) => [String(c.id), toStr(c.name) || ''])),
    batchStudents: Object.fromEntries(batches.map((b) => [String(b.id), toIdArray(b.student_ids || b.studentIds)]))
  };

  const assignmentRows = [
    ...homework.map((r) => mapHomeWorkAssignment(r, ctx)),
    ...legacyAssignments.map(mapLegacyAssignment)
  ];

  // Deduplicate by id (homework_assignments wins over legacy assignments).
  const seen = new Set();
  const dedupedAssignments = assignmentRows.filter((r) => !seen.has(r.id) && seen.add(r.id));

  const submissionRows = submissions.map(mapSubmission);

  // Null-only backfill for the columns added by 0003/0004: each UPDATE skips rows whose
  // column is already set, so re-running can never overwrite a value edited live and a
  // row a coach deleted in the app is never resurrected.
  const backfillStatements = BACKFILL_COLUMNS.map((col) => {
    const relevant = dedupedAssignments.filter((r) => r[col] !== undefined && r[col] !== null);
    if (!relevant.length) return null;
    const cases = relevant.map((r) => `WHEN ${sqlValue(r.id)} THEN ${sqlValue(r[col])}`).join(' ');
    return `UPDATE assignments SET ${col} = CASE id ${cases} ELSE ${col} END WHERE id IN (${relevant.map((r) => sqlValue(r.id)).join(', ')}) AND ${col} IS NULL;`;
  }).filter(Boolean);

  const statements = [
    '-- ChessKidoo homework re-migration (Supabase homework_assignments/hw_submissions -> D1)',
    '-- Generated by migrate-homework.mjs - idempotent: INSERT OR IGNORE plus NULL-only',
    '-- backfills, so re-running never reverts live edits or resurrects deleted rows.',
    `-- Source rows: ${homework.length} homework_assignments, ${legacyAssignments.length} legacy assignments, ${submissions.length} submissions`,
    '',
    ...insertStatements('assignments', ASSIGNMENT_COLUMNS, dedupedAssignments),
    ...backfillStatements,
    ...insertStatements('hw_submissions', SUBMISSION_COLUMNS, submissionRows)
  ];

  writeFileSync(SQL_OUT, statements.join('\n') + '\n');

  const byType = homework.reduce((acc, r) => {
    const t = toStr(r.target_type) || 'unknown';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  console.log('\n──────── SUMMARY ────────');
  console.log(`  assignments to insert:   ${dedupedAssignments.length} (from ${homework.length} coach homeworks + ${legacyAssignments.length} legacy)`);
  console.log(`  hw_submissions to insert: ${submissionRows.length}`);
  console.log(`  homework target types: ${JSON.stringify(byType)}`);
  const unresolved = dedupedAssignments.filter((r) => r._resolved === false);
  if (unresolved.length) console.log(`  ! ${unresolved.length} rows had no resolvable target → assigned to 'all'`);
  const withBatch = dedupedAssignments.filter((r) => r.target_type === 'batch' && r.batch_id).length;
  const withStudent = dedupedAssignments.filter((r) => r.target_type === 'student' && r.student_id).length;
  console.log(`  batch-targeted: ${withBatch}  student-targeted: ${withStudent}`);
  console.log(`\nSQL written to ${SQL_OUT}`);
  console.log('\nNext step - import into D1 (one-shot; this file is NOT in migrations/ so');
  console.log('`wrangler d1 migrations apply` will never re-execute it):');
  console.log(`  wrangler d1 execute chesskidoo-db --remote --file=${SQL_OUT}`);
}

main().catch((e) => {
  console.error('Failed:', e);
  process.exit(1);
});
