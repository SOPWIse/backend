import { Prisma } from "@prisma/client";
import { ModelName, SopwiseAnalyticsFilter } from "@sopwise/types/analytics.types";

export function buildGenericWhere(filter: SopwiseAnalyticsFilter, model?: ModelName): any {
  const where: Record<string, any> = {};
  const {
    filters = {},
    search,
    role,
    searchFields = [],
    dateField = 'createdAt',
    startDate,
    endDate,
  } = filter;

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) {
      where[key] = value;
    }
  }

  if ((startDate || endDate) && dateField) {
    where[dateField] = {};
    if (startDate) where[dateField].gte = new Date(startDate);
    if (endDate) where[dateField].lte = new Date(endDate);
  }

  if (search && searchFields.length > 0) {
    where.OR = searchFields.map((field) => ({
      [field]: { contains: search, mode: 'insensitive' },
    }));
  }

  type allowedModels = Omit<typeof Prisma.ModelName, 'SopWiseUser' | 'Approval' | 'FileSettings' | 'Step'>;

  const mapUserColumnOnModel: Record<keyof allowedModels, string> = {
    ExperimentLog: 'user',
    Sop: 'author',
    Comment: 'author',
  }

  if( role && model && model in mapUserColumnOnModel ) {
    const userColumn = mapUserColumnOnModel[model as keyof allowedModels];
    where[userColumn] = {
      role: role,
    };
  }

  console.log(`Built where clause: for model: ${model}`, JSON.stringify(where, null, 2));

  return where;
}
