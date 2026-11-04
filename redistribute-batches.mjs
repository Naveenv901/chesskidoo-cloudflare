import { execSync } from 'child_process';
import fs from 'fs';

const supabaseBatches = JSON.parse(fs.readFileSync('supabase-export/batches.json', 'utf8'));
const cfOutput = execSync('wrangler d1 execute chesskidoo-db --remote --command="SELECT id, full_name, coach, batch, grade FROM users WHERE role=\'student\'" --json', { encoding: 'utf8' });
const cloudflareData = JSON.parse(cfOutput);
const cloudflareStudents = cloudflareData[0].results;

const coachIdMap = {
  '0d02d369-fdf5-4251-8949-e5387f6af28b': 'c_kirubhakaran',
  '7a2ec563-b272-4638-ac3a-1b7aff63afa2': 'c_sivaram',
  'e2ae515b-2e06-4218-9561-ae75a2a2eccf': 'c_shripathy',
  '90ded1b3-2919-48a4-aefe-69da2d3038f4': 'c_sujith',
  'e348a0d74ecc07e5b30860e7117844fb': 'c_sudhin',
  'bbc9f0c3-95ac-44bc-843a-72eb2e5e2102': 'c_ranjith',
  'f28a3c85-f5e4-4f24-8407-7cdf8e2950b4': 'c_jaganathan',
  'c_gyanasurya': 'c_gyanasurya',
  'c_arivuselevam': 'c_arivuselevam',
  'c_yogesh': 'c_yogesh',
  'c_rohit': 'c_rohit',
  'c_vishnu': 'c_vishnu',
  'c_shripathy': 'c_shripathy',
  'c_sujith': 'c_sujith',
  'c_sudhin': 'c_sudhin',
  'c_ranjith': 'c_ranjith',
  'c_jaganathan': 'c_jaganathan',
  'c_kirubhakaran': 'c_kirubhakaran',
  'c_sivaram': 'c_sivaram',
  'c_rohit': 'c_rohit'
};

// Build Supabase batch plan per coach: { coach -> [{ batchId, name, targetCount }] }
const supabasePlan = {};
supabaseBatches.forEach(batch => {
  const coach = coachIdMap[batch.coach_id] || batch.coach_id;
  if (!supabasePlan[coach]) supabasePlan[coach] = [];
  supabasePlan[coach].push({
    batchId: batch.id,
    name: batch.name,
    targetCount: batch.student_ids.length
  });
});

// Group Cloudflare students by coach
const cfByCoach = {};
cloudflareStudents.forEach(s => {
  if (s.coach) {
    if (!cfByCoach[s.coach]) cfByCoach[s.coach] = [];
    cfByCoach[s.coach].push(s);
  }
});

console.log('=== REDISTRIBUTION PLAN ===\n');

let sql = '';
let totalAssigned = 0;

Object.entries(cfByCoach).forEach(([coach, students]) => {
  const plan = supabasePlan[coach] || [];
  const totalTarget = plan.reduce((sum, b) => sum + b.targetCount, 0);
  const available = students.length;
  
  console.log(`${coach}: ${available} students -> target ${totalTarget} across ${plan.length} batches`);
  
  if (plan.length === 0) {
    console.log(`  No Supabase plan, keeping current batches`);
    return;
  }
  
  // Shuffle students for fair distribution
  const shuffled = [...students].sort(() => Math.random() - 0.5);
  let idx = 0;
  
  plan.forEach(batch => {
    const assignCount = Math.min(batch.targetCount, shuffled.length - idx);
    const batchStudents = shuffled.slice(idx, idx + assignCount);
    idx += assignCount;
    
    console.log(`  ${batch.name}: assign ${batchStudents.length} students (target ${batch.targetCount})`);
    
    batchStudents.forEach(student => {
      if (student.batch !== batch.batchId) {
        sql += `UPDATE users SET batch = '${batch.batchId}' WHERE id = '${student.id}'; -- ${student.full_name}\n`;
        totalAssigned++;
      }
    });
  });
  
  // Any remaining students (if CF has more than Supabase) - assign to first batch
  if (idx < shuffled.length) {
    const firstBatch = plan[0];
    const remaining = shuffled.slice(idx);
    console.log(`  ${firstBatch.name}: assign ${remaining.length} EXTRA students`);
    remaining.forEach(student => {
      if (student.batch !== firstBatch.batchId) {
        sql += `UPDATE users SET batch = '${firstBatch.batchId}' WHERE id = '${student.id}'; -- ${student.full_name} (extra)\n`;
        totalAssigned++;
      }
    });
  }
});

fs.writeFileSync('redistribute-batches.sql', sql);
console.log(`\nGenerated ${totalAssigned} UPDATE statements`);
console.log('Run with: wrangler d1 execute chesskidoo-db --remote --file redistribute-batches.sql');