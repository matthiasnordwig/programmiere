import { getCollection } from 'astro:content';

/** Published posts, newest first. Drafts appear only in `astro dev`, never in a build. */
export async function publishedPosts() {
  const all = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const TYPE_LABEL = { 'deep-dive': 'Deep dive', 'build-log': 'Build log', diy: 'DIY' } as const;

export function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10);
}
