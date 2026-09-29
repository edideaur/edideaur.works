import type { APIContext } from 'astro';
import { SITE_URL, getSortedPosts } from '../../scripts/feeds';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(context: APIContext) {
  const posts = await getSortedPosts();

  const entries = posts.map((post) => {
    const url = `${SITE_URL}/blog/${post.slug}/`;
    const date = new Date(post.data.date).toISOString();
    const categories = post.data.tags
      .map((t) => `      <category term="${escapeXml(t)}"/>`)
      .join('\n');
    const summary = escapeXml(post.data.excerpt || '');

    return `    <entry>
      <title>${escapeXml(post.data.title)}</title>
      <link href="${url}" rel="alternate" type="text/html"/>
      <id>${url}</id>
      <published>${date}</published>
      <updated>${date}</updated>
      <summary type="html">${summary}</summary>
${categories}
    </entry>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">
  <title>EDIDEAUR.WORKS</title>
  <subtitle>i do cool shit</subtitle>
  <link href="${SITE_URL}/blog/atom.xml" rel="self" type="application/atom+xml"/>
  <link href="${SITE_URL}/blog/" rel="alternate" type="text/html"/>
  <id>${SITE_URL}/</id>
  <updated>${posts.length > 0 ? new Date(posts[0].data.date).toISOString() : new Date().toISOString()}</updated>
  <author>
    <name>edideaur</name>
    <uri>${SITE_URL}</uri>
  </author>
${entries}
</feed>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
}
