import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Post types are a design decision (docs/decisions/0004-content-types.md).
// `draft` defaults to TRUE: nothing is public until a human flips it (0003-publish-gate.md).
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(200),
    date: z.coerce.date(),
    type: z.enum(['deep-dive', 'build-log', 'diy']),
    project: z.enum(['matrix', 'gdpr-recaptcha', 'maintainer-loop', 'diy', 'other']).default('other'),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(true),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(240),
    status: z.string(),
    order: z.number().default(99),
    featured: z.boolean().default(false),
    links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
  }),
});

export const collections = { posts, projects };
