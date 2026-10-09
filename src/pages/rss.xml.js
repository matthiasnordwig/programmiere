import rss from '@astrojs/rss';
import { publishedPosts } from '../lib';
import { SITE } from '../site';

export async function GET(context) {
  const posts = (await publishedPosts()).filter((p) => !p.data.draft);
  return rss({
    title: 'programmiere.de',
    description: SITE.tagline,
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/writing/${p.id}/`,
    })),
  });
}
