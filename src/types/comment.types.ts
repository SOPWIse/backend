import { z } from 'zod';

const commentSchema = z.object({
  id: z.string().uuid().optional(),
  comment: z.string().min(1),
  status: z.enum(['RESOLVED', 'UNRESOLVED']).default('UNRESOLVED'),
  authorId: z.string().uuid(),
  contentId: z.string().uuid(),
  isDeleted: z.boolean().default(false),
  parentId: z.string().uuid().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type CreateComment = z.infer<typeof commentSchema>;
