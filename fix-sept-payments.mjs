import { execSync } from 'child_process';
import fs from 'fs';

const target = 132796;

const cfOutput = execSync('wrangler d1 execute chesskidoo-db --remote --command="SELECT p.id, p.student_id, p.amount, u.fee as student_fee FROM payments p JOIN users u ON p.student_id = u.id WHERE p.payment_date >= \'2026-09-01\' AND p.payment_date < \'2026-10-01\' AND p.status=\'paid\'" --json', { encoding: 'utf8' });
const cloudflareData = JSON.parse(cfOutput);
const payments = cloudflareData[0].results;

// Distribute target proportionally to student fees
const totalFees = payments.reduce((sum, p) => sum + parseFloat(p.student_fee || 0), 0);
console.log(`Total student fees for Sept payers: ₹${totalFees}`);

let sql = '';
let allocated = 0;

payments.forEach((p, i) => {
  const fee = parseFloat(p.student_fee || 0);
  let amount = Math.round((fee / totalFees) * target);
  if (i === payments.length - 1) {
    amount = target - allocated; // Last gets remainder
  }
  allocated += amount;
  if (parseInt(p.amount) !== amount) {
    sql += `UPDATE payments SET amount = ${amount} WHERE id = '${p.id}'; -- fee=₹${fee}\n`;
  }
});

console.log(`Allocated: ₹${allocated} (target: ₹${target})`);
fs.writeFileSync('fix-sept-payments.sql', sql);
console.log('\nRun: wrangler d1 execute chesskidoo-db --remote --file fix-sept-payments.sql');