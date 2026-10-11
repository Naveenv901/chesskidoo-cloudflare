import https from 'https';
import { writeFileSync, mkdirSync } from 'fs';

const SUPABASE_URL = 'https://vseombfkrvpffnpgbsnk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DADHCm1eB-nASpQfSi5zvA_2rMZxCJT';
const EXPORT_DIR = 'supabase-export';

const TABLES = [
  'classes',
  'attendance',
  'assignments',
  'feedback',
  'leads',
  'expenses',
  'ratings',
  'resources',
  'meetings',
  'coach_notes',
  'broadcasts',
  'hw_submissions',
  'batches'
];

function api(path) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: SUPABASE_URL.replace('https://', ''),
      path: `${path}${path.includes('?') ? '&' : '?'}apikey=${SUPABASE_ANON_KEY}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Accept': 'application/json'
      }
    }, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (e) { reject(new Error(`Failed to parse ${path}: ${e.message}`)); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function exportTable(table) {
  console.log(`Exporting ${table}...`);
  let allRows = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const path = `/rest/v1/${table}?select=*&limit=${pageSize}&offset=${page * pageSize}`;
    const data = await api(path);
    if (data.error) {
      console.log(`  Skipped ${table}: ${data.message}`);
      return [];
    }
    const rows = data || [];
    if (rows.length === 0) break;
    allRows = allRows.concat(rows);
    console.log(`  Fetched ${allRows.length} rows...`);
    if (rows.length < pageSize) break;
    page++;
  }

  return allRows;
}

async function main() {
  mkdirSync(EXPORT_DIR, { recursive: true });

  for (const table of TABLES) {
    const rows = await exportTable(table);
    if (rows.length > 0) {
      writeFileSync(`${EXPORT_DIR}/${table}.json`, JSON.stringify(rows, null, 2));
      console.log(`  Saved ${table}.json (${rows.length} rows)`);
    } else {
      console.log(`  No data for ${table}`);
    }
  }

  console.log('\nExport complete!');
}

main().catch(console.error);
