import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV || 'production', process.cwd(), 'SITE_URL');

export default defineConfig({
  site: process.env.SITE_URL || env.SITE_URL || 'https://opensite.pages.dev',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { theme: 'github-dark', wrap: true },
  },
  vite: { build: { assetsInlineLimit: 0 } },
});
