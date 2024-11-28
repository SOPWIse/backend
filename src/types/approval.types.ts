import { z } from 'zod';

export const createApprovalSchema = z.object({
  requestedId: z
    .string()
    .uuid({ message: 'Requested ID must be a valid UUID' }),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  approvedBy: z
    .string()
    .uuid({ message: 'ApprovedBy must be a valid UUID' })
    .optional(),
  contentId: z
    .string()
    .uuid({ message: 'Content ID must be a valid UUID' })
    .optional(),
  allowedRole: z.array(z.enum(['ADMIN', 'AUTHOR', 'ASSISTANT'])).optional(),
});

export type CreateApproval = z.infer<typeof createApprovalSchema>;
