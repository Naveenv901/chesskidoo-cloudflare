import fs from 'fs';

const supabaseBatches = JSON.parse(fs.readFileSync('supabase-export/batches.json', 'utf8'));
const cfOutput = fs.readFileSync('cloudflare-students.json', 'utf8');
const cloudflareData = JSON.parse(cfOutput);
const cloudflareStudents = cloudflareData[0].results;

// Coach ID mapping from import script
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

// Analyze Supabase: students per coach
const supabaseCoachStudents = {};
supabaseBatches.forEach(batch => {
  const coach = coachIdMap[batch.coach_id] || batch.coach_id;
  if (!supabaseCoachStudents[coach]) supabaseCoachStudents[coach] = [];
  supabaseCoachStudents[coach].push(...(batch.student_ids || []));
});

console.log('=== SUPERBASE STUDENTS PER COACH ===');
Object.entries(supabaseCoachStudents).forEach(([coach, students]) => {
  console.log(`  ${coach}: ${students.length} students`);
});

// Analyze Cloudflare: students per coach
const cfCoachStudents = {};
cloudflareStudents.forEach(s => {
  if (s.coach) {
    if (!cfCoachStudents[s.coach]) cfCoachStudents[s.coach] = [];
    cfCoachStudents[s.coach].push(s);
  }
});

console.log('\n=== CLOUDFLARE STUDENTS PER COACH ===');
Object.entries(cfCoachStudents).forEach(([coach, students]) => {
  console.log(`  ${coach}: ${students.length} students`);
});

// Supabase batch details per coach
console.log('\n=== SUPERBASE BATCHES PER COACH ===');
supabaseBatches.forEach(batch => {
  const coach = coachIdMap[batch.coach_id] || batch.coach_id;
  console.log(`  ${coach} - ${batch.name}: ${batch.student_ids.length} students`);
});

// Cloudflare batch details per coach
console.log('\n=== CLOUDFLARE BATCHES PER COACH ===');
const cfBatches = {};
cloudflareStudents.forEach(s => {
  if (s.coach && s.batch) {
    const key = `${s.coach}|${s.batch}`;
    if (!cfBatches[key]) cfBatches[key] = { coach: s.coach, batch: s.batch, count: 0, name: '' };
    cfBatches[key].count++;
  }
});

// Get batch names
const batchNames = {};
supabaseBatches.forEach(b => { batchNames[b.id] = b.name; });

Object.values(cfBatches).forEach(b => {
  b.name = batchNames[b.batch] || 'UNKNOWN';
  console.log(`  ${b.coach} - ${b.name} (${b.batch}): ${b.count} students`);
});