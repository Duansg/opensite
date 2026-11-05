import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export async function getPosts() {
  const now = new Date();
  return (await getCollection('posts', ({ data }) => !data.draft && data.date <= now)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
}

export function readingTime(body = '') {
  const chinese = body.match(/[\u3400-\u9fff]/g)?.length || 0;
  const words = body.replace(/[\u3400-\u9fff]/g, '').match(/[a-zA-Z0-9]+/g)?.length || 0;
  return Math.max(1, Math.ceil(chinese / 350 + words / 200));
}

export function formatDate(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll('-', '.');
}

export function postUrl(post: Post) {
  return `/blog/${post.id}/`;
}
export function tagUrl(tag: string) {
  return `/tags/${encodeURIComponent(tag)}/`;
}
