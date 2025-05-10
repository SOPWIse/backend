import { roleSchema } from '@sopwise/types/roles.types';
import { z } from 'zod';

export const createApprovalSchema = z.object({
  authorId: z.string().uuid({ message: 'Requested ID must be a valid UUID' }),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  approvedBy: z.string().uuid({ message: 'ApprovedBy must be a valid UUID' }).optional(),
  contentId: z.string().uuid({ message: 'Content ID must be a valid UUID' }).optional(),
  allowedRole: z.array(roleSchema).optional(),
});

export type CreateApproval = z.infer<typeof createApprovalSchema>;
