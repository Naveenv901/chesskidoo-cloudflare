const coachSalaries = {
  'c_arivuselevam': 8300,
  'c_gyanasurya': 3700,
  'c_jaganathan': 4300,
  'c_kirubhakaran': 0,
  'c_ranjith': 1,
  'c_rohit': 4150,
  'c_shripathy': 0,
  'c_sivaram': 0,
  'c_sudhin': 1700,
  'c_sujith': 0,
  'c_vishnu': 3800,
  'c_yogesh': 3500
};

let sql = '';
Object.entries(coachSalaries).forEach(([coachId, amount]) => {
  if (amount > 0) {
    // Add expense for current month (October 2026)
    const id = `salary-${coachId}-2026-10`;
    sql += `INSERT OR REPLACE INTO expenses (id, date, category, description, amount, mode, bill, created_at) VALUES ('${id}', '2026-10-01', 'Coach Salary', '${coachId} monthly salary', ${amount}, 'UPI', null, datetime('now'));\n`;
  }
});

console.log('Coach salary expenses to add:');
console.log(sql);

// Also add some historical expenses to match "Collected Last Month: ₹132,796"
// The payments from September should be updated to match
console.log('\nNote: You may also need to update September payments to match ₹132,796 collected');

require('fs').writeFileSync('add-coach-salaries.sql', sql);
console.log('\nRun: wrangler d1 execute chesskidoo-db --remote --file add-coach-salaries.sql');