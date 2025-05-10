import { z } from 'zod';

// Define the roles as a Zod enum
// This will ensure that only the specified roles can be used
// ADMIN;
// AUTHOR;
// ASSISTANT;
// TECHNICIAN;
// SCIENTIST;
// VP;

export const roleSchema = z.enum(['ADMIN', 'AUTHOR', 'ASSISTANT', 'TECHNICIAN', 'SCIENTIST', 'VP']);
export type Role = z.infer<typeof roleSchema>;
