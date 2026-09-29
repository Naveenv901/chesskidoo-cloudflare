import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';

const SUPABASE_URL = 'https://vseombfkrvpffnpgbsnk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DADHCm1eB-nASpQfSi5zvA_2rMZxCJT';
const D1_DB = 'chesskidoo-db';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TABLES = [
  'users', 'classes', 'attendance', 'assignments', 'hw_submissions',
  'feedback', 'leads', 'expenses', 'document', 'ratings',
  'tourRatings', 'resources', 'meetings', 'coach_notes',
  'credentials', 'batch_links', 'monthly_reports', 'puzzle_scores',
  'coach_attendance', 'broadcasts', 'sessions'
];

const JSONB_FIELDS = new Set([
  'studentIds', 'days', 'assignedTo', 'moves', 'questions_files',
  'attachment_urls', 'user_ids', 'file_urls', 'submission_text',
  'submission_urls', 'srs_data', 'timetable', 'revenue', 'last_note'
]);

const DATE_FIELDS = new Set([
  'created_at', 'updated_at', 'due_date', 'join_date', 'date', 'markedAt',
  'submittedAt', 'createdAt', 'liveStartedAt', 'joinedAt'
]);

const BOOL_FIELDS = new Set(['active', 'completed', 'replied', 'online']);

function transformRow(row) {
  const out = { ...row };
  for (const [key, value] of Object.entries(out)) {
    if (value === undefined || value === null) continue;
    if (JSONB_FIELDS.has(key) && typeof value === 'object') {
      out[key] = JSON.stringify(value);
    } else if (DATE_FIELDS.has(key) && typeof value === 'object') {
      out[key] = new Date(value).toISOString();
    } else if (BOOL_FIELDS.has(key) && typeof value === 'boolean') {
      out[key] = value ? 1 : 0;
    }
  }
  return out;
}

function sqlValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? '1' : '0';
  const s = String(val).replace(/'/g, "''");
  return `'${s}'`;
}

async function migrateTable(table) {
  console.log(`\nMigrating ${table}...`);
  let allRows = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error(`  Error fetching ${table}:`, error.message);
      return;
    }
    if (!data || data.length === 0) break;
    allRows = allRows.concat(data);
    console.log(`  Fetched ${allRows.length} rows...`);
    if (data.length < pageSize) break;
    page++;
  }

  if (allRows.length === 0) {
    console.log(`  No data in ${table}, skipping.`);
    return;
  }

  console.log(`  Transforming ${allRows.length} rows...`);
  const transformed = allRows.map(transformRow);
  const columns = Object.keys(transformed[0]);
  const colList = columns.join(', ');
  const rowsSql = transformed.map(row => {
    const vals = columns.map(col => sqlValue(row[col])).join(', ');
    return `(${vals})`;
  });

  const sql = `INSERT INTO ${table} (${colList}) VALUES ${rowsSql.join(';\nINSERT INTO ' + table + ' (' + colList + ') VALUES ')};`;
  const tempFile = `migrations/migrate_${table}.sql`;
  writeFileSync(tempFile, sql);

  console.log(`  Importing to D1...`);
  try {
    execSync(`wrangler d1 execute ${D1_DB} --remote --file=${tempFile}`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(`  ✅ ${table}: ${allRows.length} rows migrated`);
  } catch (e) {
    console.error(`  ❌ Error importing ${table}:`, e.message);
  }

  unlinkSync(tempFile);
}

async function main() {
  console.log('🚀 Starting Supabase → D1 migration\n');
  for (const table of TABLES) {
    try {
      await migrateTable(table);
    } catch (e) {
      console.error(`\n❌ Failed to migrate ${table}:`, e);
    }
  }
  console.log('\n✅ Migration complete!');
}

main().catch(console.error);
