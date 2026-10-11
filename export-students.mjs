import { execSync } from 'child_process';
import fs from 'fs';

const cfOutput = execSync('wrangler d1 execute chesskidoo-db --remote --command="SELECT id, full_name, coach, batch, session, session_type, grade FROM users WHERE role=\'student\'" --json', { encoding: 'utf8' });
const cloudflareData = JSON.parse(cfOutput);
fs.writeFileSync('cloudflare-students.json', JSON.stringify(cloudflareData, null, 2));
console.log('Saved cloudflare-students.json');