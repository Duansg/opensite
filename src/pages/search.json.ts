import type { APIRoute } from 'astro';
import { getPosts, postUrl } from '../lib/posts';
import { ui } from '../i18n';
export const GET: APIRoute = async () =>
  new Response(
    JSON.stringify(
      (await getPosts()).map((post) => ({
        title: post.data.title,
        description: post.data.description,
        category: ui.categories[post.data.category].label,
        lang: post.data.lang,
        tags: post.data.tags,
        url: postUrl(post),
        body: post.body?.replace(/```[\s\S]*?```/g, '').replace(/[#*_>`\[\]]/g, '') || '',
      })),
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  );
