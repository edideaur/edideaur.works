import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_URL, getSortedPosts } from '../../scripts/feeds';

export async function GET(context: APIContext) {
  const posts = await getSortedPosts();

  return rss({
    title: 'EDIDEAUR.WORKS',
    description: 'i do cool shit',
    site: SITE_URL,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      description: post.data.excerpt || '',
      categories: post.data.tags,
      link: `/blog/${post.slug}/`,
    })),
    customData: '<language>en</language>',
  });
}
