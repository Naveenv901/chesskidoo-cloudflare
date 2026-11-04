// Simulate ckSameCoach with actual data from the live site
const norm = (v) =>
  String(v || '')
    .toLowerCase()
    .trim()
    .replace(/^(coach_|coach-)/, '')
    .replace(/[^a-z0-9]/g, '');

const ckSameCoach = (a, b) => {
  if (!a || !b) return false;
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  return na.includes(nb) || nb.includes(na);
};

// Test cases from live data
const tests = [
  ['Kirubhakaran', 'c_kirubhakaran'],
  ['VISHNU', 'c_vishnu'],
  ['admin', 'admin-admin'],
  ['RANJITH', 'c_ranjith'],
  ['GYAN SURYA', 'c_gyansurya'],
  ['ROHITH SELVARAJ', 'c0c0c0c0-0008-4000-8000-000000000008'],
];

for (const [a, b] of tests) {
  console.log(`ckSameCoach('${a}', '${b}') = ${ckSameCoach(a, b)} | na='${norm(a)}' nb='${norm(b)}'`);
}