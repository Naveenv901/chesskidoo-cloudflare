const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const re=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
let m,i=0,bad=0;
while((m=re.exec(html))){
  i++;
  const attrs=m[1]||'';
  const code=m[2];
  if(/src\s*=/i.test(attrs)) continue;
  const line=html.slice(0,m.index).split('\n').length;
  try{ new Function(code); }
  catch(e){ bad++; console.log('BLOCK #'+i+' (src attr:'+(attrs.trim()||'none')+') starts line '+line+' -> '+e.message); }
}
console.log('TOTAL inline blocks scanned:',i,'errors:',bad);
