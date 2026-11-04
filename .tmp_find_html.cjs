const fs = require('fs');
const s = fs.readFileSync('lms/index.html', 'utf8');
// Find all attendance-related elements and modals
const patterns = ['attendance-edit', 'att-edit', 'edit-attendance', 'att-form', 'attendance-form', 'save-attendance', 'saveAttendance', 'attendance-modal', 'modal.*att', 'edit-att', 'status-select', 'att-status'];
for (const p of patterns) {
  let i = 0;
  while ((i = s.indexOf(p, i + 1)) !== -1) {
    const ctx = s.slice(Math.max(0, i - 50), i + 200).replace(/\s+/g, ' ');
    console.log(p, ':', ctx);
  }
}