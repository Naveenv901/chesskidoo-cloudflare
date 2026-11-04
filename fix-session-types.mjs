import { execSync } from 'child_process';
import fs from 'fs';

const cfOutput = execSync('wrangler d1 execute chesskidoo-db --remote --command="SELECT id, full_name, coach, batch, fee, session_type, status FROM users WHERE role=\'student\'" --json', { encoding: 'utf8' });
const cloudflareData = JSON.parse(cfOutput);
const students = cloudflareData[0].results;

const batchNames = {};
const batchOutput = execSync('wrangler d1 execute chesskidoo-db --remote --command="SELECT id, name FROM batches" --json', { encoding: 'utf8' });
const batchData = JSON.parse(batchOutput);
batchData[0].results.forEach(b => { batchNames[b.id] = b.name; });

console.log('=== FIXING SESSION TYPES & OFFLINE CLASSIFICATION ===\n');

// Supabase targets: Group=56, Single=1, Online=47, Offline=10
// Strategy: Most students = Group, 1 Single (ATISH VIDUN), Offline = students in OFFLINE batches

let sql = '';
let groupCount = 0, singleCount = 0, offlineCount = 0, onlineCount = 0;

students.forEach(s => {
  const batchName = batchNames[s.batch] || '';
  const isOfflineBatch = batchName.toUpperCase().includes('OFFLINE');
  const isSingle = s.session_type === 'SINGLE' || (s.full_name === 'ATISH VIDUN' && s.batch === '28a46516-f8e5-4c43-97c5-64e2c344db48');
  
  let newSessionType = s.session_type;
  let isOffline = isOfflineBatch;
  
  if (isSingle) {
    newSessionType = 'SINGLE';
    singleCount++;
    isOffline = false;
  } else if (isOfflineBatch) {
    newSessionType = 'Group';
    groupCount++;
    offlineCount++;
  } else {
    newSessionType = 'Group';
    groupCount++;
    onlineCount++;
  }
  
  // Update if changed
  if (s.session_type !== newSessionType) {
    sql += `UPDATE users SET session_type = '${newSessionType}' WHERE id = '${s.id}'; -- ${s.full_name} (${batchName})\n`;
  }
});

console.log(`Group: ${groupCount}, Single: ${singleCount}, Offline: ${offlineCount}, Online: ${onlineCount}`);
console.log(`Total: ${groupCount + singleCount}`);

fs.writeFileSync('fix-session-types.sql', sql);
console.log('\nRun: wrangler d1 execute chesskidoo-db --remote --file fix-session-types.sql');