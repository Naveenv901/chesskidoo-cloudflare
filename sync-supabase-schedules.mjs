import { execSync } from 'child_process';
import fs from 'fs';

const supabaseBatches = JSON.parse(fs.readFileSync('supabase-export/batches.json', 'utf8'));

// Coach UUID to short ID mapping
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

// Convert Supabase days string to array format
function parseDays(daysStr) {
  if (!daysStr || daysStr.trim() === '') return '["Monday", "Wednesday", "Friday"]';
  
  // Handle various formats
  const dayMap = {
    'MON': 'Monday', 'MONDAY': 'Monday',
    'TUE': 'Tuesday', 'TUESDAY': 'Tuesday',
    'WED': 'Wednesday', 'WEDNESDAY': 'Wednesday',
    'THU': 'Thursday', 'THUR': 'Thursday', 'THURSDAY': 'Thursday',
    'FRI': 'Friday', 'FRIDAY': 'Friday',
    'SAT': 'Saturday', 'SATURDAY': 'Saturday',
    'SUN': 'Sunday', 'SUNDAY': 'Sunday'
  };
  
  // Split by various separators
  const parts = daysStr.split(/[,&\s&]+/).filter(d => d.trim());
  const days = [];
  
  for (const part of parts) {
    const clean = part.trim().toUpperCase().replace(/&/g, '');
    if (dayMap[clean]) {
      days.push(dayMap[clean]);
    } else if (clean.includes('&')) {
      // Handle "Tue & Thu" format
      const parts = clean.split('&').map(p => p.trim());
      for (const p of parts) {
        if (dayMap[p]) days.push(dayMap[p]);
      }
    }
  }
  
  return days.length > 0 ? JSON.stringify([...new Set(days)]) : '["Monday", "Wednesday", "Friday"]';
}

let sql = '';

supabaseBatches.forEach(batch => {
  const coachId = coachIdMap[batch.coach_id] || batch.coach_id;
  const daysArray = parseDays(batch.days);
  const timeSlot = batch.time_slot || '17:00 - 18:00';
  const studentIds = JSON.stringify(batch.student_ids || []);
  
  // Find the batch in Cloudflare by matching coach and name
  sql += `UPDATE batches SET 
    days = '${daysArray}',
    time_slot = '${timeSlot.replace(/'/g, "''")}',
    student_ids = '${studentIds}',
    level = '${batch.level}',
    coach = '${coachId}'
  WHERE name = '${batch.name.replace(/'/g, "''")}' AND coach = '${coachId}';\n`;
});

fs.writeFileSync('sync-supabase-schedules.sql', sql);
console.log('Generated SQL with', supabaseBatches.length, 'batches');
console.log('\nFirst few statements:');
console.log(sql.split('\n').slice(0, 3).join('\n'));