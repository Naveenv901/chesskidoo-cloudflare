import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const CSV_PATH = 'C:/Users/Arun/Downloads/attendance_rows.csv';
const D1_DB = 'chesskidoo-db';
const TEMP_SQL = 'C:/Users/Arun/Downloads/attendance_import.sql';

function sqlValue(val) {
  if (val === null || val === undefined || val === '') return 'NULL';
  if (typeof val === 'number') return String(val);
  const s = String(val).replace(/'/g, "''");
  return `'${s}'`;
}

function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) continue;

    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx];
    });
    rows.push(row);
  }

  return rows;
}

async function main() {
  console.log('Reading CSV...');
  const content = readFileSync(CSV_PATH, 'utf-8');
  const rows = parseCSV(content);
  console.log(`Parsed ${rows.length} rows`);

  const columns = Object.keys(rows[0]);
  const colList = columns.join(', ');

  const batchSize = 50;
  let sql = '';

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const valuesSql = batch.map(row => {
      const vals = columns.map(col => sqlValue(row[col])).join(', ');
      return `(${vals})`;
    }).join(',\n');

    sql += `INSERT INTO attendance (${colList}) VALUES ${valuesSql};\n`;
  }

  writeFileSync(TEMP_SQL, sql);
  console.log('SQL file written to', TEMP_SQL);

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
