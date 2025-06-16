// analytics.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { MultiModelAnalyticsDto } from '@sopwise/modules/analytics/dto/analytics.dto';

export function RunAnalyticsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Run multi-model analytics',
      description: `
		## Execute analytics operations across multiple data models in a single request

		### Filter Parameters
		| Parameter     | Type          | Description                                                                 |
		|---------------|---------------|-----------------------------------------------------------------------------|
		| \`filters\`   | Object        | Direct Prisma where clause filters (e.g., \`{ status: 'active' }\`)         |
		| \`search\`    | string        | Search term to look for                                                     |
		| \`searchFields\`| string[]    | Fields to search within (e.g., \`["name", "email"]\`)                       |
		| \`dateField\` | string        | Field to use for date filtering                                             |
		| \`startDate\` | string/Date   | Start date for date range filtering                                         |
		| \`endDate\`   | string/Date   | End date for date range filtering                                           |
		| \`role\`      | string        | User role to filter by (e.g., \`"ADMIN"\`)                                  |
	 
		current operations supported:
		 1. COUNT - 
		 2. FIND MANY
		 3. AGGREGATE
		 4. GROUP BY
		
		ARGS object for each operation can contain:

		export enum AnalyticsOperation {
			COUNT = 'count',
			GROUP_BY = 'groupBy',
			FIND_MANY = 'findMany',
			AGGREGATE = 'aggregate',
		}

		count: null
		findMany: { take: number }
		aggregate: { fields: { avg: string[], sum: string[], max: string[], min: string[], count: string[] } }
		groupBy: { by: string[], aggregations: { _sum: { fieldName: boolean } }, orderBy: { _count: { fieldName: 'asc' | 'desc' } } }


		### Operation Examples
		{
			"models": [
				{
					"model": "Sop",
					"operation": "count",
					"filter": {
						"filters": {"isListed": true, "isDeleted": false}
					}
				},
				{
					"model": "SopWiseUser",
					"operation": "count"
				},
				{
					"model": "ExperimentLog",
					"operation": "count"
				},
				{
					"model": "ExperimentLog",
					"operation": "groupBy",
					"args": {
						"by": ["sopId"],
						"aggregations": {
							"_sum": {"total_time": true},
							"_avg": {"total_time": true}
						},
						"orderBy": {
							"_sum": {"total_time": "desc"}
						}
					}
				},
				{
					"model": "ExperimentLog",
					"operation": "aggregate",
					"filter": {
						"startDate": "2025-01-01",
						"endDate": "2025-03-28",
						"role": "ADMIN"
					}, 
					"args": {
						"fields": {
							"avg": ["total_time", "completion_percentage"],
							"sum": ["total_time"],
							"max": ["total_time"],
							"min": ["total_time"],
							"count": ["userId", "sopId"]
						}
					}
				}
			]
		}


		`,
    }),
    ApiBody({
      description: 'Analytics request payload',
      type: MultiModelAnalyticsDto,
      examples: {
        basicCount: {
          summary: 'Simple count example',
          value: {
            models: [
              {
                model: 'User',
                operation: 'count',
                filter: { filters: { status: 'active' } },
              },
            ],
          },
        },
        groupByExample: {
          summary: 'GroupBy with aggregations',
          value: {
            models: [
              {
                model: 'Order',
                operation: 'groupBy',
                args: {
                  by: ['status'],
                  aggregations: { _sum: { amount: true } },
                },
                filter: {
                  dateField: 'createdAt',
                  startDate: '2023-01-01',
                  endDate: '2023-12-31',
                },
              },
            ],
          },
        },
        multiModel: {
          summary: 'Multi-model request',
          value: {
            models: [
              {
                model: 'User',
                operation: 'count',
                filter: { filters: { status: 'active' } },
              },
              {
                model: 'Product',
                operation: 'findMany',
                args: { take: 5 },
                filter: { search: 'phone', searchFields: ['name'] },
              },
            ],
          },
        },
      },
    }),
  );
}
