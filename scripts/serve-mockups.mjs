/**
 * Zero-dependency static server for the identity prototypes.
 *
 *   npm run mockups   ->  http://localhost:4330/
 *
 * Exists because the prototypes must be judged with their real webfonts, and
 * Chrome treats fonts loaded over file:// as cross-origin and refuses them.
 * Opening the HTML directly would silently fall back to system type, which is
 * the one thing an identity comparison cannot tolerate.
 *
 * Serving from mockups/ rather than public/ keeps prototypes out of the built
 * site: anything under public/ is copied verbatim into dist/ and would ship.
 */
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

const ROOT = resolve('mockups');
const PORT = 4330;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

async function index() {
  const files = (await readdir(ROOT)).filter((f) => f.endsWith('.html')).sort();
  const links = files
    .map((f) => `<li><a href="/${f}">${f.replace(/\.html$/, '')}</a></li>`)
    .join('\n');
  return `<!doctype html><meta charset="utf-8"><title>Prototypes</title>
<style>body{font:16px/1.6 system-ui;margin:4rem auto;max-width:32rem}
li{margin:.4rem 0}a{color:#0066cc}</style>
<h1>Identity prototypes</h1><ul>${links}</ul>`;
}

createServer(async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);

  if (urlPath === '/') {
    res.writeHead(200, { 'content-type': TYPES['.html'] });
    return res.end(await index());
  }

  // normalize collapses any ../ before we test containment, so a crafted path
  // cannot escape mockups/ and read the rest of the repo.
  const target = join(ROOT, normalize(urlPath));
  if (target !== ROOT && !target.startsWith(ROOT + sep)) {
    res.writeHead(403);
    return res.end('forbidden');
  }

  try {
    const body = await readFile(target);
    res.writeHead(200, {
      'content-type': TYPES[extname(target)] ?? 'application/octet-stream',
      'cache-control': 'no-store',
    });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
  }
}).listen(PORT, () => {
  console.log(`prototypes:  http://localhost:${PORT}/`);
});
