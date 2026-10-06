import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'src', 'cv', 'public-cv.html');
const destination = join(root, 'public', 'cv', 'ali-alp-oezer.pdf');
const browser = [
  process.env.PUBLIC_CV_BROWSER,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome',
].find((candidate) => candidate && existsSync(candidate));

if (!browser) throw new Error('Set PUBLIC_CV_BROWSER to a local Chromium or Edge executable.');

const temporary = mkdtempSync(join(tmpdir(), 'public-cv-'));
const output = join(temporary, 'ali-alp-oezer.pdf');

try {
  const result = spawnSync(browser, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-pdf-header-footer',
    `--user-data-dir=${join(temporary, 'browser')}`,
    `--print-to-pdf=${output}`,
    pathToFileURL(source).href,
  ], { encoding: 'utf8', timeout: 60_000, windowsHide: true });

  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || `Browser exited ${result.status}`);
  if (!existsSync(output) || readFileSync(output).subarray(0, 5).toString() !== '%PDF-') {
    throw new Error('Browser did not produce a valid PDF.');
  }

  mkdirSync(dirname(destination), { recursive: true });
  renameSync(output, destination);
  process.stdout.write(`${destination}\n`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
