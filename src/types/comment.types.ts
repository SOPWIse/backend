import { z } from 'zod';

export const commentSchema = z.object({
  id: z.string().uuid().optional(),
  uniqueId: z.string(),
  comment: z.string().min(1),
  status: z.enum(['RESOLVED', 'UNRESOLVED']).default('UNRESOLVED'),
  authorId: z.string().uuid(),
  contentId: z.string().uuid(),
  isDeleted: z.boolean().default(false),
  parentId: z.string().uuid().nullable(),
  selectedText: z.string().optional(),
  htmlString: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type CreateComment = z.infer<typeof commentSchema>;
