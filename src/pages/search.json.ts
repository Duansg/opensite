import type { APIRoute } from 'astro';
import { getPosts, postUrl } from '../lib/posts';
export const GET: APIRoute = async () =>
  new Response(
    JSON.stringify(
      (await getPosts()).map((post) => ({
        title: post.data.title,
        description: post.data.description,
        category: post.data.category,
        tags: post.data.tags,
        url: postUrl(post),
        body: post.body?.replace(/```[\s\S]*?```/g, '').replace(/[#*_>`\[\]]/g, '') || '',
      })),
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  );
