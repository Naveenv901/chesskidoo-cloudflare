const { DatabaseSync } = require('node:sqlite');
const fs=require('fs'),path=require('path');
const dir=path.join('.wrangler','state','v3','d1','miniflare-D1DatabaseObject');
const file=path.join(dir, fs.readdirSync(dir).filter(f=>f.endsWith('.sqlite')&&f!=='metadata.sqlite')[0]);
const db=new DatabaseSync(file,{readOnly:true});
try{ console.log('LIMIT/OFFSET bind:', JSON.stringify(db.prepare('SELECT * FROM hw_submissions ORDER BY submittedAt DESC LIMIT ? OFFSET ?').all(10,0).length)); }catch(e){ console.log('LIMIT/OFFSET bind FAIL: '+e.message); }
try{ console.log('LIMIT bind:', JSON.stringify(db.prepare('SELECT * FROM hw_submissions ORDER BY submittedAt DESC LIMIT ?').all(10).length)); }catch(e){ console.log('LIMIT bind FAIL: '+e.message); }
try{ console.log('COUNT:', JSON.stringify(db.prepare('SELECT COUNT(*) as c FROM hw_submissions').first())); }catch(e){ console.log('COUNT FAIL: '+e.message); }
