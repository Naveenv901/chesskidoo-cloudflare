import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { execSync } from 'child_process';

const EXPORT_DIR = 'supabase-export-full';
const D1_DB = 'chesskidoo-db';
const TEMP_SQL = 'import-supabase-json.sql';

const TABLE_COLUMN_MAP = {
  attendance: ['id', 'userid', 'studentId', 'studentName', 'classId', 'className', 'coachId', 'coachName', 'markedAt', 'date', 'status', 'class_title', 'created_at'],
  sessions: ['id', 'user_id', 'role', 'email', 'created_at', 'expires_at']
};

function sqlValue(val) {
  if (val === null || val === undefined || val === '') return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? '1' : '0';
  const s = String(val).replace(/'/g, "''");
  return `'${s}'`;
}

function getValidColumns(data, allowedCols) {
  if (!Array.isArray(data) || data.length === 0) return [];
  const first = data[0];
  const validCols = [];
  for (const key of Object.keys(first)) {
    if (allowedCols.includes(key)) {
      validCols.push(key);
    }
  }
  return validCols;
}

async function main() {
  const files = readdirSync(EXPORT_DIR).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} JSON files to import`);

  let sql = '';

  for (const file of files) {
    const table = file.replace('.json', '');
    const path = `${EXPORT_DIR}/${file}`;
    console.log(`Processing ${file}...`);

    try {
      const content = readFileSync(path, 'utf-8');
      const data = JSON.parse(content);
      console.log(`  Parsed ${data.length} rows`);

      if (data.length === 0) {
        console.log(`  Skipping ${file} - no rows`);
        continue;
      }

      const allowedCols = TABLE_COLUMN_MAP[table];
      if (!allowedCols) {
        console.log(`  No column mapping for table ${table}, skipping`);
        continue;
      }

      const validCols = getValidColumns(data, allowedCols);
      if (validCols.length === 0) {
        console.log(`  No valid columns found for ${table}, skipping`);
        continue;
      }

      const finalHeaders = validCols.map(h => `"${h}"`).join(', ');
      const batchSize = 50;

      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const valuesSql = batch.map(row => {
          const vals = validCols.map(col => {
            const val = row[col];
            if (val === undefined || val === null) return 'NULL';
            return sqlValue(val);
          }).join(', ');
          return `(${vals})`;
        }).join(',\n');

        sql += `INSERT OR REPLACE INTO ${table} (${finalHeaders}) VALUES ${valuesSql};\n`;
      }

      console.log(`  Added ${data.length} rows to SQL for ${table}`);
    } catch (e) {
      console.error(`  Error processing ${file}:`, e.message);
    }
  }

  writeFileSync(TEMP_SQL, sql);
  console.log('\nSQL file written to', TEMP_SQL);

  try {
    const result = execSync(`wrangler d1 execute ${D1_DB} --remote --file="${TEMP_SQL}"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('Import result:', result);
  } catch (e) {
    console.error('Import failed:', e.message);
  }

  console.log('\nImport complete!');
}

main().catch(console.error);