import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pdf = join(root, 'public', 'cv', 'ali-alp-oezer.pdf');

if (!existsSync(pdf) || statSync(pdf).size < 10_000 || readFileSync(pdf).subarray(0, 5).toString() !== '%PDF-') {
  throw new Error('Public CV is missing or invalid. Run npm run build:cv, then review the PDF.');
}
