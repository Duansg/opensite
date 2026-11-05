import assert from 'node:assert/strict';
import { dictionaries } from '../src/i18n/index.ts';
import { formatMessage, formatCount } from '../src/i18n/format.ts';
import { normalizeCategory } from '../src/lib/categories.ts';

const { 'zh-CN': zhCN, en } = dictionaries;

const placeholders = (text) => [...new Set(text.match(/\{\w+\}/g) || [])].sort();

function verifyTranslation(reference, translated, path = 'en') {
  if (typeof reference === 'string') {
    assert.equal(typeof translated, 'string', `Expected text at ${path}`);
    assert(translated.trim(), `Empty translation at ${path}`);
    assert.deepEqual(
      placeholders(translated),
      placeholders(reference),
      `Wrong parameters at ${path}`,
    );
    return;
  }
  assert(translated && typeof translated === 'object', `Missing translation at ${path}`);
  if (Object.hasOwn(reference, 'one') && Object.hasOwn(reference, 'other')) {
    const rules = new Set(['zero', 'one', 'two', 'few', 'many', 'other']);
    assert(Object.hasOwn(translated, 'other'), `Missing plural fallback at ${path}`);
    for (const [rule, text] of Object.entries(translated)) {
      assert(rules.has(rule), `Unknown plural rule at ${path}.${rule}`);
      verifyTranslation(reference.other, text, `${path}.${rule}`);
    }
    return;
  }
  assert.deepEqual(
    Object.keys(translated).sort(),
    Object.keys(reference).sort(),
    `Wrong fields at ${path}`,
  );
  for (const key of Object.keys(reference)) {
    verifyTranslation(reference[key], translated[key], `${path}.${key}`);
  }
}

for (const [locale, messages] of Object.entries(dictionaries)) {
  verifyTranslation(zhCN, messages, locale);
}
assert.equal(formatCount(en.search.count, 0, 'en'), '0 articles');
assert.equal(formatCount(en.search.count, 1, 'en'), '1 article');
assert.equal(formatCount(en.search.count, 2, 'en'), '2 articles');
assert.equal(formatCount(en.search.count, 1000, 'en'), '1,000 articles');
assert.equal(formatCount(zhCN.search.count, 1, 'zh-CN'), '1 篇文章');
assert.equal(formatCount(zhCN.search.count, 2, 'zh-CN'), '2 篇文章');
assert.equal(formatCount({ other: '{count} items' }, 1, 'en'), '1 items');
assert.equal(
  formatCount({ two: '{count} items (two)', other: '{count} items' }, 2, 'ar-u-nu-latn'),
  '2 items (two)',
);
assert.equal(formatMessage(en.posts.readLabel, { title: '$& {title}' }), 'Read: $& {title}');
assert.equal(formatMessage('{missing}', {}), '{missing}');
for (const [legacy, canonical] of [
  ['工程', 'engineering'],
  ['设计', 'design'],
  ['随笔', 'thoughts'],
  ['工具', 'toolbox'],
]) {
  assert.equal(normalizeCategory(legacy), canonical);
  assert.equal(normalizeCategory(canonical), canonical);
}
for (const invalid of ['', 'all', 'unknown', '__proto__', 'toString']) {
  assert.equal(normalizeCategory(invalid), undefined);
}
console.log(
  'Verified translation parameters, plural forms, number formatting and legacy categories.',
);
