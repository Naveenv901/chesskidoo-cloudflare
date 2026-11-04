import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const DOWNLOADS = 'C:/Users/Arun/Downloads';
const D1_DB = 'chesskidoo-db';
const TEMP_SQL = 'C:/Users/Arun/Downloads/import-remaining.sql';

const IMPORTS = [
  {
    file: 'expenditures_rows.csv',
    table: 'expenses',
    columnMap: { payment_mode: 'mode', bill_url: 'bill' },
    skipColumns: ['updated_at']
  },
  {
    file: 'batch_links_rows.csv',
    table: 'batch_links'
  }
];

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
            const mappedKey = imp.columnMap[key] || key;
            if (!imp.skipColumns || !imp.skipColumns.includes(mappedKey)) {
              newRow[mappedKey] = value;
            }
          }
          return newRow;
        });
      }

      // Skip columns
      if (imp.skipColumns) {
        headers = headers.filter(h => !imp.skipColumns.includes(h));
        rows = rows.map(row => {
          const newRow = {};
          for (const [key, value] of Object.entries(row)) {
            if (!imp.skipColumns.includes(key)) {
              newRow[key] = value;
            }
          }
          return newRow;
        });
      }

      const finalHeaders = headers.map(h => `"${h}"`).join(', ');
      const batchSize = 50;

      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const valuesSql = batch.map(row => {
          const vals = headers.map(col => sqlValue(row[col])).join(', ');
          return `(${vals})`;
        }).join(',\n');

        sql += `INSERT OR IGNORE INTO ${imp.table} (${finalHeaders}) VALUES ${valuesSql};\n`;
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
