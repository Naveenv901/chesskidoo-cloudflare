const base = 'https://chesskidoo.pages.dev';
const r = await fetch(base + '/api/query?table=assignments&cols=pragma_table_info(assignments)');
const t = await r.text();
console.log(t.slice(0, 800));