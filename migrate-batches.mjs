import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';

const SUPABASE_URL = 'https://vseombfkrvpffnpgbsnk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DADHCm1eB-nASpQfSi5zvA_2rMZxCJT';
const D1_DB = 'chesskidoo-db';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function sqlValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? '1' : '0';
  const s = String(val).replace(/'/g, "''");
  return `'${s}'`;
}

async function migrateBatches() {
  console.log('\nMigrating batches from Supabase to D1...');
  
  let allRows = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('  Error fetching batches:', error.message);
      return;
    }
    if (!data || data.length === 0) break;
    allRows = allRows.concat(data);
    console.log(`  Fetched ${allRows.length} rows...`);
    if (data.length < pageSize) break;
    page++;
  }

  if (allRows.length === 0) {
    console.log('  No batches found in Supabase');
    return;
  }

  console.log(`  Transforming ${allRows.length} rows...`);
  const transformed = allRows.map(row => {
    const out = {
      id: row.id,
      name: row.name || row.batch_name || 'Unnamed Batch',
      coach: row.coach || row.coach_id || null,
      level: row.level || null,
      time: row.time || row.batch_time || null,
      active: row.active !== false ? 1 : 0,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
    };
    return out;
  });

  const columns = Object.keys(transformed[0]);
  const colList = columns.join(', ');
  const rowsSql = transformed.map(row => {
    const vals = columns.map(col => sqlValue(row[col])).join(', ');
    return `(${vals})`;
  });

  const sql = `INSERT INTO batches (${colList}) VALUES ${rowsSql.join(';\nINSERT INTO batches (' + colList + ') VALUES ')};`;
  const tempFile = 'migrations/migrate_batches.sql';
  writeFileSync(tempFile, sql);

  console.log('  Importing to D1...');
  try {
    execSync(`wrangler d1 execute ${D1_DB} --remote --file=${tempFile}`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(`  ✅ batches: ${allRows.length} rows migrated`);
  } catch (e) {
    console.error('  ❌ Error importing batches:', e.message);
  }

  unlinkSync(tempFile);
}

async function main() {
  await migrateBatches();
  console.log('\n✅ Batch migration complete!');
}

main().catch(console.error);
