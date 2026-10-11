import https from 'https';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';

const SUPABASE_URL = 'https://vseombfkrvpffnpgbsnk.supabase.co';
const EXPORT_DIR = 'supabase-export-full';

const TABLES = [
  'classes',
  'attendance',
  // Homework lives in homework_assignments (coach portal) — homework_assignments
  // maps to the D1 `assignments` table. It was missing here, which is why
  // coach-assigned homework never got exported/migrated.
  'homework_assignments',
  'homework_submissions',
  'assignments',
  'hw_submissions',
  'coach_attendance',
  'coach_notes',
  'sessions',
  'meetings',
  'leads',
  'expenses',
  'ratings',
  'resources',
  'feedback',
  'broadcasts',
  // Reference tables (needed to resolve batch → students and coach names)
  'students',
  'coaches',
];

function api(path, key, retries = 3) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: SUPABASE_URL.replace('https://', ''),
      path: `${path}${path.includes('?') ? '&' : '?'}apikey=${key}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Accept': 'application/json',
        'Prefer': 'count=exact'
      },
      timeout: 30000
    }, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (e) { reject(new Error(`Failed to parse: ${e.message}`)); }
      });
    });
    req.on('error', (e) => {
      if (retries > 1) {
        setTimeout(() => api(path, key, retries - 1).then(resolve).catch(reject), 2000);
      } else {
        reject(e);
      }
    });
    req.on('timeout', () => {
      req.destroy();
      if (retries > 1) {
        setTimeout(() => api(path, key, retries - 1).then(resolve).catch(reject), 2000);
      } else {
        reject(new Error('Request timeout'));
      }
    });
    req.end();
  });
}

async function exportTable(table, key) {
  console.log(`Exporting ${table}...`);
  let allRows = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const path = `/rest/v1/${table}?select=*&limit=1000&offset=${page * 1000}`;
    try {
      const data = await api(path, key);
      if (data.error) {
        console.log(`  Error ${table}: ${data.message}`);
        break;
      }
      const rows = data || [];
      if (rows.length === 0) break;
      allRows = allRows.concat(rows);
      console.log(`  Fetched ${allRows.length} rows...`);
      if (rows.length < 1000) break;
      page++;
      
      if (page % 5 === 0) {
        writeFileSync(`${EXPORT_DIR}/${table}.json`, JSON.stringify(allRows, null, 2));
        console.log(`  Saved partial ${table}.json (${allRows.length} rows)`);
      }
    } catch (e) {
      console.error(`  Error fetching page ${page}: ${e.message}`);
      break;
    }
  }

  return allRows;
}

async function main() {
  if (process.argv.length < 3) {
    console.log('Usage: node export-supabase-service.mjs YOUR_SERVICE_ROLE_KEY');
    console.log('Get your service role key from: https://supabase.com/dashboard/project/vseombfkrvpffnpgbsnk/settings/api');
    process.exit(1);
  }

  const serviceKey = process.argv[2];
  
  mkdirSync(EXPORT_DIR, { recursive: true });

  for (const table of TABLES) {
    const allRows = await exportTable(table, serviceKey);
    
    if (allRows.length > 0) {
      writeFileSync(`${EXPORT_DIR}/${table}.json`, JSON.stringify(allRows, null, 2));
      console.log(`  Saved ${table}.json (${allRows.length} rows)`);
    } else {
      console.log(`  No data for ${table}`);
    }
  }

  console.log('\nExport complete! Files saved to', EXPORT_DIR);
}

main().catch(console.error);
