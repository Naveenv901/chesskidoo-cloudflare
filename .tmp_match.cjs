const base = 'https://chesskidoo.pages.dev';

// Check what coaches look like and what name format assignments use
const users = await (await fetch(base + '/api/query?table=users')).json();
const coaches = (users.data || []).filter(u => u.role === 'coach');
console.log('Coaches:');
coaches.slice(0, 5).forEach(c => console.log('  id:', c.id, 'full_name:', c.full_name));

// Check assignments coach values vs coach IDs
const hw = await (await fetch(base + '/api/homework')).json();
const coachVals = [...new Set((hw.data || []).map(h => h.coach).filter(Boolean))];
console.log('\nAssignment coach values:', coachVals.slice(0, 15));

// Check if any assignment coach value matches a coach ID
const coachIds = new Set(coaches.map(c => c.id));
const coachNames = new Set(coaches.map(c => c.full_name));
const matchById = coachVals.filter(v => coachIds.has(v));
const matchByName = coachVals.filter(v => coachNames.has(v));
console.log('\nMatch by ID:', matchById);
console.log('Match by name:', matchByName);