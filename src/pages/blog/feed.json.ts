import type { APIContext } from 'astro';
import { SITE_URL, getSortedPosts } from '../../scripts/feeds';

export async function GET(context: APIContext) {
  const posts = await getSortedPosts();

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'EDIDEAUR.WORKS',
    home_page_url: `${SITE_URL}/blog/`,
    feed_url: `${SITE_URL}/blog/feed.json`,
    description: 'i do cool shit',
    language: 'en',
    authors: [
      {
        name: 'edideaur',
        url: SITE_URL,
      },
    ],
    items: posts.map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}/`;
      const date = new Date(post.data.date).toISOString();
      return {
        id: url,
        url,
        title: post.data.title,
        summary: post.data.excerpt || '',
        date_published: date,
        date_modified: date,
        tags: post.data.tags,
      };
    }),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  });
}
