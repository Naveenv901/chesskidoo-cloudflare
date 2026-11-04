const fs = require('fs');
const s = fs.readFileSync('lms/scripts.js', 'utf8');
const lines = s.split(/\r?\n/);
const targets = ['/api/events', '/api/achievements', '/api/batches', '/api/payments', '/api/rating_history', '/api/audit', '/api/messages', '/api/resources'];
const holders = ['data', 'res', 'json', 'result', 'list', 'rows', 'items', 'body', 'payload', 'obj', 'r', 'p'];
for (const t of targets) {
  const set = new Set();
  lines.forEach((ln, i) => {
    if (!ln.includes(t)) return;
    for (let j = Math.max(0, i - 4); j < Math.min(lines.length, i + 45); j++) {
      const re = /\b([a-zA-Z_][a-zA-Z0-9_]*)\.(\w+)\b/g;
      let m;
      while ((m = re.exec(lines[j]))) {
        if (holders.includes(m[1])) set.add(m[2]);
      }
    }
  });
  console.log(t + ' -> ' + [...set].sort().join(', ') + '\n');
}
