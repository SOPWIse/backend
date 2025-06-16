// analytics.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { MultiModelAnalyticsDto } from '@sopwise/modules/analytics/dto/analytics.dto';

const examples = {
  models: [
    {
      model: 'Sop',
      operation: 'count',
      filter: {
        filters: {isListed: true, isDeleted: false},
      },
    },
    {
      model: 'SopWiseUser',
      operation: 'count',
    },
    {
      model: 'ExperimentLog',
      operation: 'count',
    },
    {
      model: 'ExperimentLog',
      operation: 'groupBy',
      filter: {
        role: 'ADMIN',
      },
      args: {
        by: ['sopId'],
        aggregations: {
          sum: ['total_time'],
          avg: ['total_time'],
          count: ['total_time'],
          min: ['total_time'],
          max: ['total_time'],
        },
        orderBy: {
          _sum: {total_time: 'desc'},
        },
      },
    },
    {
      model: 'ExperimentLog',
      operation: 'aggregate',
      filter: {
        startDate: '2025-01-01',
        endDate: '2025-03-28',
        role: 'ADMIN',
      },
      args: {
        fields: {
          avg: ['total_time', 'completion_percentage'],
          sum: ['total_time'],
          max: ['total_time'],
          min: ['total_time'],
          count: ['userId', 'sopId'],
        },
      },
    },
  ],
};


export function RunAnalyticsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Run multi-model analytics',
      description: `
	Execute analytics operations across multiple data models in a single request

	Filter Parameters
		type SopwiseAnalyticsFilter = {
			filters?: Record<string, any>;
			search?: string;
			role?: string;
			searchFields?: string[];
			dateField?: string;
			startDate?: string;
			endDate?: string;
		};

		Date format: YYYY-MM-DD
		Example: 2025-01-01

		| Parameter     | Type          | Description                                                                 |
		|---------------|---------------|-----------------------------------------------------------------------------|
		| filters.      | Object        | Direct Prisma where clause filters (e.g., \`{ status: 'active' }\`)         |
		| search        | string        | Search term to look for                                                     |
		| searchFields. | string[]      | Fields to search within (e.g., \`["name", "email"]\`)                       |
		| dateField.    | string        | Field to use for date filtering                                             |
		| startDate.    | string/Date   | Start date for date range filtering                                         |
		| endDate.      | string/Date   | End date for date range filtering                                           |
		| role.         | string        | User role to filter by (e.g., \`"ADMIN"\`)                                  |
		----------------------------------------------------------------------------------------------------------------

		Request item structure:
		type ModelAnalyticsRequest =
			| { model: ModelName; operation: 'count'; filter?: SopwiseAnalyticsFilter }
			| { model: ModelName; operation: 'findMany'; args?: { take?: number }; filter?: SopwiseAnalyticsFilter }
			| { model: ModelName; operation: 'groupBy'; args: { by: string[]; aggregations: Partial<Record<'sum'|'avg'|'min'|'max'|'count', string[]>>; orderBy?: any }; filter?: SopwiseAnalyticsFilter }
			| { model: ModelName; operation: 'aggregate'; args: { fields: Partial<Record<'sum'|'avg'|'min'|'max'|'count', string[]>> }; filter?: SopwiseAnalyticsFilter };

		Request payload structure:
		type MultiModelAnalytics = { models: ModelAnalyticsRequest[] };



		Response structure:
		interface ModelAnalyticsResult {
			model: ModelName;
			operation: 'count'|'findMany'|'groupBy'|'aggregate';
			result: any;
		}

		Routes to handlers:
			count → prisma[model].count({ where })
			findMany → prisma[model].findMany({ where, take })
			groupBy → prisma[model].groupBy({ by, where, _sum/_avg/_min/_max/_count, orderBy })
			aggregate → prisma[model].aggregate({ where, _sum/_avg/_min/_max }) + optional count
		`,
    }),
    ApiBody({
      description: 'Analytics request payload Example',
      type: MultiModelAnalyticsDto,
      examples: {
        comprehensiveMultiModelAnalytics: {
					description: 'Comprehensive multi-model analytics request example',
					value: examples,
				}
      },
    }),
  );
}
