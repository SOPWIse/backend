import { Prisma } from '@prisma/client';
import { z } from 'zod';

const prismaModelNames = Object.values(Prisma.ModelName) as [string, ...string[]];
const ModelNameSchema = z.enum(prismaModelNames);
export type ModelName = z.infer<typeof ModelNameSchema>;

export const SopwiseAnalyticsFilterSchema = z.object({
  filters: z.record(z.any()).optional(),
  search: z.string().optional(),
  role: z.array(z.string()).optional(),
  searchFields: z.array(z.string()).optional(),
  dateField: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const BaseRequest = z.object({
  model: ModelNameSchema,
  filter: SopwiseAnalyticsFilterSchema.optional(),
});

export const ModelAnalyticsRequestSchema = z.discriminatedUnion('operation', [
  BaseRequest.extend({
    operation: z.literal('count'),
    args: z.undefined().optional(),
  }),

  BaseRequest.extend({
    operation: z.literal('findMany'),
    args: z
      .object({
        take: z.number().int().positive().optional().default(100),
      })
      .optional(),
  }),

  BaseRequest.extend({
    operation: z.literal('groupBy'),
    args: z.object({
      by: z.array(z.string()).min(1, 'At least one grouping field is required'),
      aggregations: z
        .object({
          sum: z.array(z.string()).optional(),
          avg: z.array(z.string()).optional(),
          min: z.array(z.string()).optional(),
          max: z.array(z.string()).optional(),
          count: z.array(z.string()).optional(),
        })
        .refine(
          (fields) => fields.sum?.length || fields.avg?.length || fields.min?.length || fields.max?.length,
          'At least one aggregation field (sum/avg/min/max) must be provided',
        ).optional(),
      orderBy: z.any().optional(),
    }),
  }),

  BaseRequest.extend({
    operation: z.literal('aggregate'),
    args: z.object({
      fields: z
        .object({
          sum: z.array(z.string()).optional(),
          avg: z.array(z.string()).optional(),
          min: z.array(z.string()).optional(),
          max: z.array(z.string()).optional(),
          count: z.array(z.string()).optional(),
        })
        .refine(
          (fields) => fields.sum?.length || fields.avg?.length || fields.min?.length || fields.max?.length || fields.count?.length,
          'At least one aggregation field (sum/avg/min/max) must be provided',
        ).optional(),
    }),
  }),
]);

export const MultiModelAnalyticsSchema = z.object({
  models: z.array(ModelAnalyticsRequestSchema),
});

export type MultiModelAnalytics = z.infer<typeof MultiModelAnalyticsSchema>;
export type SopwiseAnalyticsFilter = z.infer<typeof SopwiseAnalyticsFilterSchema>;
export type ModelAnalyticsRequest = z.infer<typeof ModelAnalyticsRequestSchema>;
