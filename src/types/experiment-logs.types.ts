import * as z from 'zod';

export const stepSchema = z.object({
  id: z.string().uuid().optional(),
  logId: z.string().uuid(),
  time_taken: z.number().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  tenant: z.string().default('sopwise'),
  createdAt: z.date(),
  updatedAt: z.date(),
  form_data: z.record(z.any()).optional(),
  meta_data: z.record(z.any()).optional(),
});

export const experimentLogSchema = z.object({
  id: z.string().uuid().optional(),
  sopId: z.string(),
  userId: z.string(),
  status: z.string().default('PENDING'),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  tenant: z.string().default('sopwise'),
  total_time: z.number().optional(),
  meta_data: z.record(z.any()).optional(),
  completion_percentage: z.number().optional(),
  steps: z.array(stepSchema),
});
export type StepSchema = z.infer<typeof stepSchema>;
export type ExperimentLogSchema = z.infer<typeof experimentLogSchema>;
export type UpdateLogSchema = Partial<Omit<ExperimentLogSchema, 'steps'>> & { steps?: Partial<StepSchema>[] };
