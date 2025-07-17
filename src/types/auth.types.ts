import { roleSchema } from '@sopwise/types/roles.types';
import { z } from 'zod';

const login = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(30, 'Password must be maximum of 30 characters long'),
});

const register = z.object({
  email: z.string().email('Invalid email format'),
  role: roleSchema,
  name: z.string(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(30, 'Password must be maximum of 30 characters long'),
  provider: z.string().default('sopwise').optional(),
  metaData: z.any().optional(),

  designation: z.string().optional(),
  department: z.string().optional(),
  profilePicture: z.string().optional(),
  country: z.string().optional(),
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[1-9]\d{1,14}$/.test(val), { message: 'Invalid phone number format' }),
  companyName: z.string().optional(),
});

const signInToken = z.object({
  email: z.string().email('Invalid email format'),
  userId: z.string(),
});

export type Login = z.infer<typeof login>;
export type Register = z.infer<typeof register>;
export type SignInToken = z.infer<typeof signInToken>;
