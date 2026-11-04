import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const DOWNLOADS = 'C:/Users/Arun/Downloads';
const D1_DB = 'chesskidoo-db';
const TEMP_SQL = 'C:/Users/Arun/Downloads/import-fix.sql';

const IMPORTS = [
  {
    file: 'coaches_rows.csv',
    table: 'users',
    columnMap: {
      name: 'full_name',
      phone: 'phone_number',
      specialization: 'level',
      experience: 'rating',
      hourly_rate: 'fee',
      salary: 'revenue',
      payment_status: 'payment_status',
      monthly_fee: 'fee',
      pay_level: 'level'
    },
    skipColumns: ['bio', 'availability', 'batch_count', 'account_status', 'photo_url', 'address'],
    defaultColumns: { role: 'coach' },
    idMap: {
      '0d02d369-fdf5-4251-8949-e5387f6af28b': 'c_kirubhakaran',
      '7a2ec563-b272-4638-ac3a-1b7aff63afa2': 'c_sivaram',
      'e2ae515b-2e06-4218-9561-ae75a2a2eccf': 'c_shripathy',
      '90ded1b3-2919-48a4-aefe-69da2d3038f4': 'c_sujith',
      'e348a0d74ecc07e5b30860e7117844fb': 'c_sudhin',
      'bbc9f0c3-95ac-44bc-843a-72eb2e5e2102': 'c_ranjith',
      'f28a3c85-f5e4-4f24-8407-7cdf8e2950b4': 'c_jaganathan'
    }
  },
  {
    file: 'students_rows.csv',
    table: 'users',
    idMap: {
      '0d02d369-fdf5-4251-8949-e5387f6af28b': 'c_kirubhakaran',
      '7a2ec563-b272-4638-ac3a-1b7aff63afa2': 'c_sivaram',
      'e2ae515b-2e06-4218-9561-ae75a2a2eccf': 'c_shripathy',
      '90ded1b3-2919-48a4-aefe-69da2d3038f4': 'c_sujith',
      'e348a0d74ecc07e5b30860e7117844fb': 'c_sudhin',
      'bbc9f0c3-95ac-44bc-843a-72eb2e5e2102': 'c_ranjith',
      'f28a3c85-f5e4-4f24-8407-7cdf8e2950b4': 'c_jaganathan'
    },
    columnMap: {
      name: 'full_name',
      phone: 'phone_number',
      parent_name: 'childEmail',
      parent_phone: 'child_id',
      address: 'city',
      enrollment_date: 'join_date',
      session_mode: 'session_type',
      session_time: 'session',
      monthly_fee: 'fee',
      credit_balance: 'revenue',
      outstanding_balance: 'revenue',
      billing_anchor_year: 'revenue',
      billing_anchor_month: 'revenue',
      last_payment_applied_month: 'revenue',
      coach_id: 'coach',
      lichess_username: 'auth_id',
      chesscom_username: 'auth_id',
      chessable_username: 'auth_id',
      batch_id: 'batch'
    },
    skipColumns: ['country_code', 'notes', 'account_status'],
    defaultColumns: { role: 'student' }
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
      const newHeaders = [];
      const headerMap = {};
      
      for (const h of headers) {
        const mapped = imp.columnMap[h] || h;
        newHeaders.push(mapped);
        headerMap[h] = mapped;
      }

      const mappedRows = rows.map(row => {
        const newRow = {};
        for (const [key, value] of Object.entries(row)) {
          const mappedKey = headerMap[key] || key;
          newRow[mappedKey] = value;
        }
        
        // Map IDs for coaches
        if (imp.idMap && newRow.id && imp.idMap[newRow.id]) {
          newRow.id = imp.idMap[newRow.id];
        }
        
        // Remap any values that match idMap keys (e.g., coach references)
        if (imp.idMap) {
          for (const [key, value] of Object.entries(newRow)) {
            if (key !== 'id' && imp.idMap[value]) {
              newRow[key] = imp.idMap[value];
            }
          }
        }
        
      // Add default columns
      if (imp.defaultColumns) {
        for (const [key, value] of Object.entries(imp.defaultColumns)) {
          newRow[key] = value;
          if (!newHeaders.includes(key)) {
            newHeaders.push(key);
          }
        }
      }
        
        return newRow;
      });

      // Remove skipped columns
      if (imp.skipColumns && imp.skipColumns.length > 0) {
        const skipped = new Set(imp.skipColumns);
        const filteredHeaders = newHeaders.filter(h => !skipped.has(h));
        const filteredRows = mappedRows.map(row => {
          const newRow = {};
          for (const [key, value] of Object.entries(row)) {
            if (!skipped.has(key)) {
              newRow[key] = value;
            }
          }
          return newRow;
        });
        
        // Update headers and rows
        newHeaders.length = 0;
        filteredHeaders.forEach(h => newHeaders.push(h));
        mappedRows.length = 0;
        filteredRows.forEach(r => mappedRows.push(r));
      }

      const finalHeaders = newHeaders.map(h => `"${h}"`).join(', ');
      const batchSize = 50;

      for (let i = 0; i < mappedRows.length; i += batchSize) {
        const batch = mappedRows.slice(i, i + batchSize);
        const valuesSql = batch.map(row => {
          const vals = newHeaders.map(col => sqlValue(row[col])).join(', ');
          return `(${vals})`;
        }).join(',\n');

        sql += `INSERT OR REPLACE INTO ${imp.table} (${finalHeaders}) VALUES ${valuesSql};\n`;
      }

      console.log(`  Added ${mappedRows.length} rows to SQL`);
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
