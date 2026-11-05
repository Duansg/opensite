import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, join, dirname, extname } from 'node:path';

const root = resolve('dist');
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory() ? walk(join(directory, entry.name)) : join(directory, entry.name),
      ),
    )
  ).flat();
}
const files = await walk(root);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
assert(htmlFiles.length >= 5, 'Missing core static pages');
const search = JSON.parse(await readFile(join(root, 'search.json'), 'utf8'));
const rss = await readFile(join(root, 'rss.xml'), 'utf8');
assert.equal(
  search.length,
  (rss.match(/<item>/g) || []).length,
  'RSS/search article counts differ',
);
for (const required of [
  'index.html',
  'blog/index.html',
  'archive/index.html',
  'about/index.html',
  '404.html',
  'rss.xml',
  'robots.txt',
  'sitemap-index.xml',
  '_headers',
]) {
  assert((await stat(join(root, required))).isFile(), `Missing ${required}`);
}
let references = 0;
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `Expected one h1: ${file}`);
  assert(html.includes('name="viewport"'), `Missing viewport: ${file}`);
  assert(html.includes('rel="canonical"'), `Missing canonical URL: ${file}`);
  assert(!html.includes('fonts.googleapis.com'), 'Fonts must be self-hosted');
  for (const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const ref = match[1].split(/[?#]/)[0];
    if (!ref || /^(?:[a-z]+:|\/\/)/i.test(ref)) continue;
    const local = decodeURIComponent(ref);
    const target = local.startsWith('/')
      ? resolve(root, `.${local}`)
      : resolve(dirname(file), local);
    assert(target === root || target.startsWith(`${root}/`), `Reference escapes output: ${ref}`);
    const candidates = extname(target) ? [target] : [join(target, 'index.html'), `${target}.html`];
    // Tag names and static paths can contain periods; check directory index too.
    if (local.endsWith('/')) candidates.unshift(join(target, 'index.html'));
    let found = false;
    for (const candidate of candidates) {
      try {
        if ((await stat(candidate)).isFile()) {
          found = true;
          break;
        }
      } catch {}
    }
    assert(found, `Broken local reference ${ref} in ${file}`);
    references++;
  }
}
for (const post of search) {
  assert(post.body && post.title && post.url && post.tags, 'Incomplete search index item');
  assert(
    (await stat(join(root, decodeURIComponent(post.url), 'index.html'))).isFile(),
    `Missing article ${post.url}`,
  );
}
const errorPage = await readFile(join(root, '404.html'), 'utf8');
assert(errorPage.includes('content="noindex"'), '404 must not be indexed');
console.log(
  `Verified ${htmlFiles.length} static HTML pages, ${search.length} articles, ${references} local references, RSS, sitemap, search index, 404 and metadata.`,
);
