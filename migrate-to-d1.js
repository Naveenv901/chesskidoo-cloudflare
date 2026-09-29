import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

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

function transformRow(table, row) {
  const transformed = { ...row };
  
  // Convert UUID-like IDs to strings
  if (transformed.id && typeof transformed.id === 'object') {
    transformed.id = String(transformed.id);
  }
  
  // Convert JSONB fields to JSON strings
  const jsonbFields = ['studentIds', 'days', 'assignedTo', 'moves', 'questions_files', 
                       'attachment_urls', 'user_ids', 'file_urls', 'submission_text',
                       'submission_urls', 'srs_data', 'timetable', 'revenue', 'last_note'];
  
  for (const field of jsonbFields) {
    if (transformed[field] !== undefined && transformed[field] !== null) {
      if (typeof transformed[field] === 'object') {
        transformed[field] = JSON.stringify(transformed[field]);
      }
    }
  }
  
  // Convert timestamps to ISO strings
  const dateFields = ['created_at', 'updated_at', 'due_date', 'join_date', 'date', 'markedAt',
                      'submittedAt', 'createdAt', 'liveStartedAt', 'joinedAt'];
  
  for (const field of dateFields) {
    if (transformed[field] && typeof transformed[field] === 'object') {
      transformed[field] = new Date(transformed[field]).toISOString();
    }
  }
  
  // Convert booleans to integers for SQLite
  const boolFields = ['active', 'completed', 'replied', 'online'];
  for (const field of boolFields) {
    if (transformed[field] !== undefined) {
      transformed[field] = transformed[field] ? 1 : 0;
    }
  }
  
  return transformed;
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
  const transformed = allRows.map(row => transformRow(table, row));
  
  // Generate INSERT SQL
  const columns = Object.keys(transformed[0]);
  const placeholders = columns.map(() => '?').join(', ');
  const sql = transformed.map(row => {
    const values = columns.map(col => {
      const val = row[col];
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return val;
      if (typeof val === 'boolean') return val ? 1 : 0;
      return `'${String(val).replace(/'/g, "''")}'`;
    }).join(', ');
    return `(${values})`;
  }).join(';\nINSERT INTO ${table} (${columns.join(', ')}) VALUES ');
  
  const fullSql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${sql};`;
  
  // Write to temp file
  const fs = await import('fs');
  const tempFile = `migrations/migrate_${table}.sql`;
  fs.writeFileSync(tempFile, fullSql);
  
  console.log(`  Importing to D1...`);
  try {
    const result = execSync(
      `wrangler d1 execute ${D1_DB} --remote --file=${tempFile}`,
      { encoding: 'utf8', stdio: 'pipe' }
    );
    console.log(`  ✅ ${table}: ${allRows.length} rows migrated`);
  } catch (e) {
    console.error(`  ❌ Error importing ${table}:`, e.message);
  }
  
  // Cleanup
  fs.unlinkSync(tempFile);
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
