import { defineCollection, z } from 'astro:content';

const projectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    date: z.string(),
    featured: z.boolean().default(false),
    order: z.number().default(99),
    tags: z.array(z.string()),
    githubUrl: z.string().default("https://github.com/irfanwidiantoro"),
    demoUrl: z.string().optional(),
    architectureImage: z.string().optional(),
    company: z.string().optional(),
    role: z.string().optional(),
    projectType: z.string().optional(),
    gallery: z.array(z.union([
      z.string(),
      z.object({
        image: z.string(),
        title: z.string().optional()
      })
    ])).optional(),
    metrics: z.array(z.object({
      label: z.string(),
      value: z.string()
    })).optional(),
    isPlaceholder: z.boolean().default(true),
  }),
});

export const collections = {
  projects: projectsCollection,
};

