import assert from 'node:assert/strict';

const origin = process.argv[2] || 'http://127.0.0.1:4321';
async function get(path, type = 'text') {
  const response = await fetch(new URL(path, origin));
  const body = await response.text();
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}\n${body.slice(0, 200)}`);
  assert(
    !body.includes("Cannot find module 'virtual:astro:logger'"),
    `${path}: Astro runtime modules are inconsistent`,
  );
  assert(!body.includes('An error occurred.'), `${path}: Astro error overlay returned`);
  return type === 'json' ? JSON.parse(body) : body;
}
const posts = await get('/search.json', 'json');
for (const path of [
  '/',
  '/blog/',
  '/archive/',
  '/about/',
  '/rss.xml',
  '/robots.txt',
  ...posts.map((post) => post.url),
]) {
  const html = await get(path);
  assert(
    html.includes(path === '/robots.txt' ? 'Sitemap:' : 'OPEN.SITE'),
    `${path}: missing site content`,
  );
  console.log(`200 ${path}`);
}
const missing = await fetch(new URL('/this-page-does-not-exist/', origin));
assert.equal(missing.status, 404, 'Missing paths should return HTTP 404');
console.log(
  `Runtime smoke check passed: ${posts.length} articles, core pages, RSS, search and HTTP 404.`,
);
