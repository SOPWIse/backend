import { z } from 'zod';

//
const SopStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'LISTED', 'REJECTED']);

export const sopSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
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
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
  contentUrl: z
    .string()
    .url('Invalid URL')
    .max(500, 'Content URL must not exceed 500 characters')
    .optional(),
});

export type CreateSop = z.infer<typeof sopSchema>;
