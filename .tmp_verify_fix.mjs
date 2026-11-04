const base = 'https://chesskidoo.pages.dev';

(async () => {
  // Get coach list and a sample assignment
  const coaches = await (await fetch(base + '/api/users?role=coach')).json();
  const hw = await (await fetch(base + '/api/homework')).json();

  // Pick a coach and an assignment that belongs to them by name
  const coach = coaches.data.find(c => c.full_name === 'Kirubhakaran');
  const assignment = (hw.data || []).find(h => h.coach === 'Kirubhakaran');
  console.log('Coach:', coach.id, coach.full_name);
  console.log('Assignment coach:', assignment?.coach);

  // Simulate the fixed ownership check
  const cId = coach.id;
  const cName = coach.full_name;
  const assignCoach = assignment.coach;

  const norm = (v) => String(v || '').toLowerCase().trim().replace(/^(coach_|coach-)/, '').replace(/[^a-z0-9]/g, '');
  const ckSameCoach = (a, b) => {
    if (!a || !b) return false;
    const na = norm(a), nb = norm(b);
    if (!na || !nb) return false;
    return na === nb || na.includes(nb) || nb.includes(na);
  };

  // OLD check (would fail)
  const oldResult = ckSameCoach(assignCoach, cId);
  // NEW check (should pass)
  const newResult = ckSameCoach(assignCoach, cName);

  console.log('\nOLD check (coach name vs coach ID):', oldResult, '-> would show "can only edit your own"');
  console.log('NEW check (coach name vs coach name):', newResult, '-> edit allowed');
})();