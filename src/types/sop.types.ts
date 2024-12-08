import { z } from 'zod';

//
const SopStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'LISTED']);

export const sopSchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must not exceed 255 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must not exceed 1000 characters'),
  authorId: z.string().uuid('Invalid UUID for authorId'),
  status: SopStatusEnum.optional().default('DRAFT'),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(100, 'Category must not exceed 100 characters')
    .default('Operations'),
  isListed: z.boolean().default(false),
  isDeleted: z.boolean().default(false),
  publishedAt: z.date().optional().nullable(),
  metaData: z.record(z.any()).optional(),
  content: z
    .string()
    .min(0, 'Content is required')
    .max(1000000, 'Content is too long')
    .default(''),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  contentUrl: z
    .string()
    .url('Invalid URL')
    .max(500, 'Content URL must not exceed 500 characters')
    .optional(),
});

export type CreateSop = z.infer<typeof sopSchema>;
