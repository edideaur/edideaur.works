import { getCollection, type CollectionEntry } from 'astro:content';

export const SITE_URL = 'https://edideaur.works';

export type BlogPost = CollectionEntry<'blog'>;

export async function getSortedPosts(): Promise<BlogPost[]> {
    return (await getCollection('blog')).sort(
        (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    );
}
