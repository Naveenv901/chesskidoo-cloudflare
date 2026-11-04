const fs = require('fs');
const s = fs.readFileSync('lms/scripts.js', 'utf8');
// Search for the attendance edit form handler - broader patterns
const patterns = [
  'edit-attendance',
  'attendance-edit',
  'att-edit',
  'editAtt',
  'editAttStatus',
  'saveEditAtt',
  'markAbsent',
  'markPresent',
  'setAttStatus',
  'updateAttStatus',
  'att-status',
  'attendance-status',
  'saveAttendance',
  'save-attendance',
  'status.*=.*function',
  'attendance.*=.*function',
  'function.*[Aa]ttendance',
  'function.*[Ss]tatus',
];
for (const p of patterns) {
  let i = 0;
  while ((i = s.indexOf(p, i + 1)) !== -1) {
    const ctx = s.slice(Math.max(0, i - 80), i + 200).replace(/\s+/g, ' ');
    console.log(p, ':', ctx);
  }
}