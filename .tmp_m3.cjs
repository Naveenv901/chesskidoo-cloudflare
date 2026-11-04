const fs=require('fs');
const s=fs.readFileSync('migrations/0001_init.sql','utf8');
const lines=s.split(/\r?\n/);
lines.slice(143,176).forEach((l,i)=>console.log((144+i)+'| '+l));
