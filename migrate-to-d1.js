import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';

const SUPABASE_URL = 'https://vseombfkrvpffnpgbsnk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DADHCm1eB-nASpQfSi5zvA_2rMZxCJT';
const D1_DB = 'chesskidoo-db';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TABLES_TO_MIGRATE = [
  'students',
  'coaches',
  'classes',
  'attendance',
  'assignments',
  'homework_assignments',
  'hw_submissions',
  'feedback',
  'leads',
  'expenses',
  'document',
  'ratings',
  'tourRatings',
  'resources',
  'meetings',
  'coach_notes',
  'credentials',
  'batch_links',
  'monthly_reports',
  'puzzle_scores',
  'coach_attendance',
  'broadcasts'
];

const D1_TABLE_MAP = {
  'students': 'users',
  'coaches': 'users',
  'homework_assignments': 'assignments',
  'hw_submissions': 'hw_submissions',
  'document': 'document',
  'tourRatings': 'tourRatings',
  'coach_notes': 'coach_notes',
  'batch_links': 'batch_links',
  'monthly_reports': 'monthly_reports',
  'puzzle_scores': 'puzzle_scores',
  'coach_attendance': 'coach_attendance'
};

const STUDENT_COLUMN_MAP = {
  'id': 'id',
  'name': 'full_name',
  'email': 'email',
  'phone': 'phone_number',
  'age': 'age',
  'grade': 'grade',
  'parent_name': 'childEmail',
  'parent_phone': 'phone_number',
  'address': 'city',
  'enrollment_date': 'join_date',
  'status': 'status',
  'coach_id': 'coach',
  'rating': 'rating',
  'notes': 'last_note',
  'created_at': 'created_at',
  'updated_at': 'updated_at',
  'account_status': 'status',
  'session_mode': 'session_type',
  'session_time': 'session',
  'monthly_fee': 'fee',
  'due_date': 'due_date',
  'payment_status': 'payment_status',
  'credit_balance': 'revenue',
  'outstanding_balance': 'revenue',
  'billing_anchor_year': 'revenue',
  'billing_anchor_month': 'revenue',
  'last_payment_applied_month': 'revenue',
  'country_code': 'city',
  'lichess_username': 'auth_id',
  'chesscom_username': 'auth_id',
  'chessable_username': 'auth_id',
  'batch_id': 'batch'
};

const COACH_COLUMN_MAP = {
  'id': 'id',
  'name': 'full_name',
  'email': 'email',
  'phone': 'phone_number',
  'specialization': 'level',
  'experience': 'rating',
  'rating': 'rating',
  'bio': 'last_note',
  'status': 'status',
  'hourly_rate': 'fee',
  'availability': 'session',
  'created_at': 'created_at',
  'updated_at': 'updated_at',
  'monthly_fee': 'fee',
  'batch_count': 'classes',
  'pay_level': 'fee',
  'role': 'role',
  'address': 'city',
  'account_status': 'status',
  'salary': 'revenue',
  'payment_status': 'payment_status',
  'photo_url': 'photo'
};

const DATE_FIELDS = new Set([
  'created_at', 'updated_at', 'due_date', 'join_date', 'date', 'markedAt',
  'submittedAt', 'createdAt', 'liveStartedAt', 'joinedAt', 'enrollment_date'
]);

const BOOL_FIELDS = new Set(['active', 'completed', 'replied', 'online']);

function transformRow(table, row) {
  const out = {};
  let columnMap = {};
  
  if (table === 'students') {
    columnMap = STUDENT_COLUMN_MAP;
    out.role = 'student';
  } else if (table === 'coaches') {
    columnMap = COACH_COLUMN_MAP;
    out.role = 'coach';
  } else {
    columnMap = {};
    for (const key of Object.keys(row)) {
      columnMap[key] = key;
    }
  }

  for (const [srcKey, value] of Object.entries(row)) {
    if (value === undefined || value === null) continue;
    
    const destKey = columnMap[srcKey] || srcKey;
    
    if (DATE_FIELDS.has(destKey) && typeof value === 'object') {
      out[destKey] = new Date(value).toISOString();
    } else if (BOOL_FIELDS.has(destKey) && typeof value === 'boolean') {
      out[destKey] = value ? 1 : 0;
    } else {
      out[destKey] = value;
    }
  }

  // Ensure required fields have defaults
  if (!out.role) out.role = table === 'coaches' ? 'coach' : 'student';
  if (out.rating === undefined) out.rating = 800;
  
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
  const d1Table = D1_TABLE_MAP[table] || table;
  console.log(`\nMigrating ${table} → ${d1Table}...`);
  
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
  const transformed = allRows.map(row => transformRow(table, row));
  const columns = Object.keys(transformed[0]);
  const colList = columns.join(', ');
  const rowsSql = transformed.map(row => {
    const vals = columns.map(col => sqlValue(row[col])).join(', ');
    return `(${vals})`;
  });

  const sql = `INSERT INTO ${d1Table} (${colList}) VALUES ${rowsSql.join(';\nINSERT INTO ' + d1Table + ' (' + colList + ') VALUES ')};`;
  const tempFile = `migrations/migrate_${table}.sql`;
  writeFileSync(tempFile, sql);

  console.log(`  Importing to D1...`);
  try {
    execSync(`wrangler d1 execute ${D1_DB} --remote --file=${tempFile}`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(`  ✅ ${table} → ${d1Table}: ${allRows.length} rows migrated`);
  } catch (e) {
    console.error(`  ❌ Error importing ${table}:`, e.message);
  }

  unlinkSync(tempFile);
}

async function main() {
  console.log('🚀 Starting Supabase → D1 migration\n');
  for (const table of TABLES_TO_MIGRATE) {
    try {
      await migrateTable(table);
    } catch (e) {
      console.error(`\n❌ Failed to migrate ${table}:`, e);
    }
  }
  console.log('\n✅ Migration complete!');
}

main().catch(console.error);
