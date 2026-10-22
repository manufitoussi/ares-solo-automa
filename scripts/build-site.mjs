// Builds the website in _site/: copies site/, copies the app from app/ (but its prototype) and fills
// its service worker, copies the PDF files of rules/<lang>/ and cards/<lang>/ to downloads/,
// and fills the download lists of the pages.
import { createHash } from 'node:crypto';
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, '_site');
const sources = ['rules/fr', 'rules/en', 'cards/fr', 'cards/en'];
const marker = /<!-- downloads ([\w/-]+) -->[\s\S]*?<!-- \/downloads -->/g;

/** lists the PDF files of a folder, sorted by name. */
async function listPdf(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.pdf'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

/** formats a file size for a language. */
function formatSize(bytes, lang) {
  const mb = bytes / (1024 * 1024);
  const value = mb < 0.1 ? 0.1 : Math.round(mb * 10) / 10;
  return lang === 'fr' ? `PDF, ${String(value).replace('.', ',')} Mo` : `PDF, ${value} MB`;
}

/** escapes a text for HTML. */
function escapeHtml(text) {
  return text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

/** lists the HTML files of a folder, recursively. */
async function listHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => join(entry.parentPath, entry.name));
}

await rm(out, { recursive: true, force: true });
await cp(join(root, 'site'), out, {
  recursive: true,
  filter: (src) => basename(src) !== 'README.md',
});

// the app: its sources are served as they are (no build step), without the former prototype,
// the tests, the types and the demo
const appSource = join(root, 'app');
const appOut = join(out, 'app');
const notServed = (name) => name.endsWith('.test.js') || name.endsWith('.d.ts') || ['README.md', 'card-demo.html', 'prototype'].includes(name);
await cp(appSource, appOut, { recursive: true, filter: (src) => !notServed(basename(src)) });

// the service worker caches every file of the app, under a version that changes with them
const appFiles = (await readdir(appOut, { recursive: true, withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name !== 'sw.js')
  .map((entry) => relative(appOut, join(entry.parentPath, entry.name)).split(sep).join('/'))
  .sort();
const hash = createHash('sha256');
for (const file of appFiles) hash.update(file).update(await readFile(join(appOut, file)));
const version = hash.digest('hex').slice(0, 12);
const worker = join(appOut, 'sw.js');
const devWorker = await readFile(worker, 'utf8');
const builtWorker = devWorker
  .replace('const VERSION = "dev";', `const VERSION = "${version}";`)
  .replace('const FILES = ["./"];', `const FILES = ${JSON.stringify(['./', ...appFiles.map((file) => `./${file}`)])};`);
if (!builtWorker.includes(version) || builtWorker.includes('const FILES = ["./"];')) throw new Error('app/sw.js: VERSION or FILES not found');
await writeFile(worker, builtWorker);
console.log(`app: ${appFiles.length} files, version ${version}`);

// copies the PDF files and remembers them by source folder
const downloads = new Map();
for (const source of sources) {
  const files = [];
  for (const name of await listPdf(join(root, source))) {
    const target = join(out, 'downloads', source, name);
    await mkdir(dirname(target), { recursive: true });
    await cp(join(root, source, name), target);
    files.push({ name, size: (await stat(target)).size });
  }
  downloads.set(source, files);
  console.log(`${source}: ${files.length} PDF`);
}

// replaces each download block by the list of its files, if any
for (const page of await listHtml(out)) {
  const html = await readFile(page, 'utf8');
  const prefix = relative(dirname(page), out).split(sep).filter(Boolean).map(() => '../').join('');
  const result = html.replace(marker, (block, source) => {
    const files = downloads.get(source);
    if (!files) throw new Error(`${relative(root, page)}: unknown downloads folder "${source}"`);
    if (files.length === 0) return block;
    const lang = source.split('/')[1];
    const items = files.map(({ name, size }) => {
      const href = `${prefix}downloads/${source}/${encodeURIComponent(name)}`;
      return `<li><a href="${href}" download>${escapeHtml(name)}</a> <span class="size">${formatSize(size, lang)}</span></li>`;
    });
    return `<ul class="files">\n${items.join('\n')}\n</ul>`;
  });
  if (result !== html) await writeFile(page, result);
}

console.log(`site built in ${relative(root, out)}/`);
