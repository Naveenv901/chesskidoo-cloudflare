import { execSync } from 'child_process';
import fs from 'fs';

const supabaseBatches = JSON.parse(fs.readFileSync('supabase-export/batches.json', 'utf8'));
const cfOutput = execSync('wrangler d1 execute chesskidoo-db --remote --command="SELECT id, full_name, coach, batch FROM users WHERE role=\'student\'" --json', { encoding: 'utf8' });
const cloudflareData = JSON.parse(cfOutput);
const cloudflareStudents = cloudflareData[0].results;

// Build mapping from Supabase: student_id -> batch_id
const studentToBatch = {};
supabaseBatches.forEach(batch => {
  (batch.student_ids || []).forEach(studentId => {
    studentToBatch[studentId] = batch.id;
  });
});

console.log(`Supabase has ${Object.keys(studentToBatch).length} student->batch mappings`);

// Generate UPDATE statements
let sql = '';
let updated = 0;
let skipped = 0;

cloudflareStudents.forEach(student => {
  const correctBatch = studentToBatch[student.id];
  const currentBatch = student.batch;
  
  if (correctBatch && correctBatch !== currentBatch) {
    sql += `UPDATE users SET batch = '${correctBatch}' WHERE id = '${student.id}'; -- ${student.full_name}\n`;
    updated++;
  } else if (!correctBatch && currentBatch) {
    // Student in CF has batch but not in Supabase - set to NULL
    sql += `UPDATE users SET batch = NULL WHERE id = '${student.id}'; -- ${student.full_name} (orphaned)\n`;
    updated++;
  } else {
    skipped++;
  }
});

fs.writeFileSync('fix-batch-assignments.sql', sql);
console.log(`\nGenerated ${updated} UPDATE statements`);
console.log(`${skipped} students already correct or no Supabase mapping`);
console.log('\nRun with: wrangler d1 execute chesskidoo-db --remote --file fix-batch-assignments.sql');