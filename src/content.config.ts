import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { categories, normalizeCategory } from './lib/categories';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.preprocess(
      (value) => (typeof value === 'string' ? (normalizeCategory(value) ?? value) : value),
      z.enum(categories),
    ),
    lang: z.string().optional(),
    tags: z.array(z.string()).default([]),
    cover: z
      .enum(['computer', 'planet', 'window', 'coffee', 'blocks', 'terminal'])
      .default('computer'),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    demo: z.boolean().default(false),
  }),
});

export const collections = { posts };
