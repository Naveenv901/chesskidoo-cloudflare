import { execSync } from 'child_process';
import fs from 'fs';

// Batch data: batch_id -> { days, time_slot, student_ids }
const batchData = {
  // VISHNU BATCH 1
  'bbe1a981-4d47-46f5-aea4-526d53e1e808': {
    days: '["Monday", "Wednesday", "Friday"]',
    time_slot: '17:00 - 18:00',
    student_ids: []
  },
  // Other batches - need to populate based on student assignments
};

async function main() {
  // Get student IDs per batch
  const cfOutput = execSync('wrangler d1 execute chesskidoo-db --remote --command="SELECT id, batch FROM users WHERE role=\'student\' AND status=\'active\'" --json', { encoding: 'utf8' });
  const cloudflareData = JSON.parse(cfOutput);
  const students = cloudflareData[0].results;

  // Group students by batch
  const batchStudents = {};
  students.forEach(s => {
    if (s.batch) {
      if (!batchStudents[s.batch]) batchStudents[s.batch] = [];
      batchStudents[s.batch].push(s.id);
    }
  });

  console.log('Student counts per batch:', Object.fromEntries(Object.entries(batchStudents).map(([k,v]) => [k, v.length])));

  // Generate UPDATE statements
  let sql = '';
  Object.entries(batchStudents).forEach(([batchId, studentIds]) => {
    sql += `UPDATE batches SET student_ids = '${JSON.stringify(studentIds)}' WHERE id = '${batchId}';\n`;
  });

  // Set default days and time_slot for batches without them
  const batchOutput = execSync('wrangler d1 execute chesskidoo-db --remote --command="SELECT id, name FROM batches" --json', { encoding: 'utf8' });
  const batchData2 = JSON.parse(batchOutput);
  batchData2[0].results.forEach(b => {
    if (!b.days && !b.time_slot) {
      sql += `UPDATE batches SET days = '["Monday", "Wednesday", "Friday"]', time_slot = '17:00 - 18:00' WHERE id = '${b.id}';\n`;
    }
  });

  fs.writeFileSync('populate-batches.sql', sql);
  console.log('\nGenerated SQL file. Run with: wrangler d1 execute chesskidoo-db --remote --file populate-batches.sql');
}

main().catch(console.error);