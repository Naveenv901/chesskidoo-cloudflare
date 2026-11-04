import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const DOWNLOADS = 'C:/Users/Arun/Downloads';
const D1_DB = 'chesskidoo-db';
const TEMP_SQL = 'C:/Users/Arun/Downloads/import-all.sql';

const IMPORTS = [
  { file: 'users_rows.csv', table: 'users' },
  { file: 'coaches_rows.csv', table: 'users', role: 'coach', columnMap: { name: 'full_name' } },
  { file: 'students_rows.csv', table: 'users', role: 'student', columnMap: { name: 'full_name' } },
  { file: 'batches_rows.csv', table: 'batches' },
  { file: 'payments_rows.csv', table: 'payments' },
  { file: 'expenditures_rows.csv', table: 'expenses' },
  { file: 'achievements_rows.csv', table: 'achievements' },
  { file: 'audit_rows.csv', table: 'audit_log' },
  { file: 'homework_assignments_rows.csv', table: 'assignments' },
  { file: 'batch_links_rows.csv', table: 'batch_links' },
  { file: 'attendance_rows.csv', table: 'attendance' }
];

const COACH_ID_MAP = {
  '0d02d369-fdf5-4251-8949-e5387f6af28b': 'c_kirubhakaran',
  '7a2ec563-b272-4638-ac3a-1b7aff63afa2': 'c_sivaram',
  'e2ae515b-2e06-4218-9561-ae75a2a2eccf': 'c_shripathy',
  '90ded1b3-2919-48a4-aefe-69da2d3038f4': 'c_sujith',
  'e348a0d74ecc07e5b30860e7117844fb': 'c_sudhin',
  'bbc9f0c3-95ac-44bc-843a-72eb2e5e2102': 'c_ranjith',
  'f28a3c85-f5e4-4f24-8407-7cdf8e2950b4': 'c_jaganathan'
};

function sqlValue(val) {
  if (val === null || val === undefined || val === '') return 'NULL';
  if (typeof val === 'number') return String(val);
  const s = String(val).replace(/'/g, "''");
  return `'${s}'`;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;

    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx];
    });
    rows.push(row);
  }

  return { headers, rows };
}

async function main() {
  let sql = '';

  for (const imp of IMPORTS) {
    const path = `${DOWNLOADS}/${imp.file}`;
    console.log(`Processing ${imp.file}...`);

    try {
      const content = readFileSync(path, 'utf-8');
      let { headers, rows } = parseCSV(content);
      console.log(`  Parsed ${rows.length} rows`);

      if (rows.length === 0) {
        console.log(`  Skipping ${imp.file} - no rows`);
        continue;
      }

      // Apply column mapping
      if (imp.columnMap) {
        headers = headers.map(h => imp.columnMap[h] || h);
        rows = rows.map(row => {
          const newRow = {};
          for (const [key, value] of Object.entries(row)) {
            newRow[imp.columnMap[key] || key] = value;
          }
          return newRow;
        });
      }

      // Map coach IDs for coach imports
      if (imp.role === 'coach') {
        rows = rows.map(row => {
          if (row.id && COACH_ID_MAP[row.id]) {
            row.id = COACH_ID_MAP[row.id];
          }
          return row;
        });
      }

      // Add role column if needed
      if (imp.role) {
        headers.push('role');
        rows = rows.map(row => ({ ...row, role: imp.role }));
      }

      let columns = headers.map(h => `"${h}"`).join(', ');
      let batchSize = 50;

      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const valuesSql = batch.map(row => {
          const vals = headers.map(col => sqlValue(row[col])).join(', ');
          return `(${vals})`;
        }).join(',\n');

        sql += `INSERT OR IGNORE INTO ${imp.table} (${columns}) VALUES ${valuesSql};\n`;
      }

      console.log(`  Added ${rows.length} rows to SQL`);
    } catch (e) {
      console.error(`  Error processing ${imp.file}:`, e.message);
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
