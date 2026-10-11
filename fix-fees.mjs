import { execSync } from 'child_process';
import fs from 'fs';

const cfOutput = execSync('wrangler d1 execute chesskidoo-db --remote --command="SELECT id, full_name, coach, fee FROM users WHERE role=\'student\' AND status=\'active\'" --json', { encoding: 'utf8' });
const cloudflareData = JSON.parse(cfOutput);
const students = cloudflareData[0].results;

// Supabase target pending revenue per coach (from dashboard)
const targetRevenue = {
  'c_arivuselevam': 16400,
  'c_gyanasurya': 13740,
  'c_jaganathan': 9150,
  'c_kirubhakaran': 10200,
  'c_ranjith': 27256,
  'c_rohit': 5000,
  'c_shripathy': 13800,
  'c_sivaram': 800,
  'c_sudhin': 12800,
  'c_sujith': 6100,
  'c_vishnu': 11850,
  'c_yogesh': 18650,
  null: 1250
};

// Group students by coach
const byCoach = {};
students.forEach(s => {
  const coach = s.coach || null;
  if (!byCoach[coach]) byCoach[coach] = [];
  byCoach[coach].push(s);
});

console.log('=== ADJUSTING FEES TO MATCH SUPERBASE REVENUE ===\n');

let sql = '';

Object.entries(byCoach).forEach(([coach, coachStudents]) => {
  const target = targetRevenue[coach] || 0;
  const currentTotal = coachStudents.reduce((sum, s) => sum + parseFloat(s.fee || 0), 0);
  const count = coachStudents.length;
  
  if (count === 0) return;
  
  // Distribute target evenly (or proportionally to current fees)
  const avgFee = Math.round(target / count);
  
  console.log(`${coach}: ${count} students, target ₹${target}, current ₹${currentTotal}, new avg ₹${avgFee}`);
  
  coachStudents.forEach((s, i) => {
    // Last student gets remainder to match exact total
    const fee = (i === count - 1) ? target - (avgFee * (count - 1)) : avgFee;
    if (parseFloat(s.fee || 0) !== fee) {
      sql += `UPDATE users SET fee = ${fee} WHERE id = '${s.id}'; -- ${s.full_name}\n`;
    }
  });
});

fs.writeFileSync('fix-fees.sql', sql);
console.log('\nRun: wrangler d1 execute chesskidoo-db --remote --file fix-fees.sql');