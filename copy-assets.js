import { cpSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const copy = (src, dest) => {
  if (!existsSync(src)) return;
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
};

copy(resolve('assets/js'), resolve('dist/assets/js'));
copy(resolve('assets/js'), resolve('dist/lms/assets/js'));
copy(resolve('assets/css'), resolve('dist/assets/css'));
copy(resolve('assets/css'), resolve('dist/lms/assets/css'));
copy(resolve('lms'), resolve('dist/lms'));
