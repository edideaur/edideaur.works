import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        date: z.union([z.string(), z.date()]),
        tags: z.array(z.string()).default([]),
        excerpt: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
    }),
});

export const collections = { blog };
