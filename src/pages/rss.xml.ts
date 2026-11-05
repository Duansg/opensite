import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, postUrl } from '../lib/posts';
import { locale } from '../config';
import { ui, siteMetadata } from '../i18n';
export async function GET(context: APIContext) {
  return rss({
    title: siteMetadata.title,
    description: siteMetadata.description,
    site: context.site!,
    items: (await getPosts()).map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: postUrl(post),
      categories: [ui.categories[post.data.category].label, ...post.data.tags],
    })),
    customData: `<language>${locale}</language>`,
  });
}
