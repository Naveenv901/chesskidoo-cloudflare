const base = 'https://chesskidoo.pages.dev';

// Inspect existing assignments to see what format coach is stored in
const r = await fetch(base + '/api/homework');
const data = await r.json();
const rows = data.data || [];
console.log('Total assignments:', rows.length);
// Show a sample of coach values
const seen = new Set();
for (const row of rows) {
  const coach = row.coach;
  if (coach && !seen.has(coach)) {
    seen.add(coach);
    console.log('coach:', JSON.stringify(coach), '| target_type:', row.target_type, '| created_by:', row.created_by);
  }
}