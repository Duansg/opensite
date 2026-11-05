import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const slug = process.argv[2];
const title = process.argv.slice(3).join(' ') || '写下一个新的想法';
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error(
    '用法：npm run new:post -- my-first-post "我的第一篇文章"\nslug 仅支持小写英文字母、数字和中划线。',
  );
  process.exit(1);
}
const directory = resolve('src/content/posts');
const file = resolve(directory, `${slug}.md`);
await mkdir(directory, { recursive: true });
try {
  await writeFile(
    file,
    `---\ntitle: ${JSON.stringify(title)}\ndescription: "用一两句话介绍这篇文章。"\ndate: ${new Date().toISOString().slice(0, 10)}\ncategory: "thoughts"\nlang: "zh-CN"\ntags: ["日常"]\ncover: "coffee"\nfeatured: false\ndraft: true\n---\n\n在这里开始写作。\n\n## 第一个想法\n\n把探索的过程记录下来。\n`,
    { flag: 'wx' },
  );
  console.log(`已创建草稿：${file}\n发布前将 draft 改为 false。`);
} catch (error) {
  console.error(error.code === 'EEXIST' ? '同名文章已存在，未覆盖。' : error.message);
  process.exit(1);
}
