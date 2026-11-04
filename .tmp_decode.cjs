const fs=require('fs');
for(const f of ['.tmp_validate.txt','.tmp_gap_out.txt','.tmp_fields.txt','.tmp_summary.txt']){
  if(!fs.existsSync(f)){ console.log('MISSING '+f); continue; }
  let b=fs.readFileSync(f);
  let s;
  if(b.length>=2 && b[0]===0xFF && b[1]===0xFE){ s=b.toString('utf16le'); }
  else if(b.length>=2 && b[0]===0xFE && b[1]===0xFF){ s=b.toString('utf16le'); s=s.slice(1); }
  else if(b.length>=2 && b[1]===0x00){ s=b.toString('utf16le'); }
  else { s=b.toString('utf8'); }
  fs.writeFileSync(f+'.decoded.txt', s);
  console.log('### '+f+' len='+s.length);
}
