// analytics.decorator.ts
import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiOperation } from "@nestjs/swagger";
import { MultiModelAnalyticsDto } from "@sopwise/modules/analytics/dto/analytics.dto";







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

		### Operation Examples
		**Count Operation:**
		\`\`\`json
		{
			"model": "User",
			"operation": "count",
			"filter": {
				"filters": { "status": "active" }
			}
		}
		\`\`\`

		**GroupBy Operation:**
		\`\`\`json
		{
			"model": "Order",
			"operation": "groupBy",
			"args": {
				"by": ["status"],
				"aggregations": {
					"_sum": { "amount": true }
				}
			},
			"filter": {
				"dateField": "createdAt",
				"startDate": "2023-01-01",
				"endDate": "2023-12-31"
			}
		}
		\`\`\`

		**Multi-Model Request:**
		\`\`\`json
		{
			"models": [
				{
					"model": "User",
					"operation": "count",
					"filter": { ... }
				},
				{
					"model": "Product",
					"operation": "findMany",
					"args": { "take": 5 },
					"filter": { ... }
				}
			]
		}
		\`\`\`
		`
		}),
		ApiBody({
			description: 'Analytics request payload',
			type: MultiModelAnalyticsDto,
			examples: {
				basicCount: {
					summary: 'Simple count example',
					value: {
						models: [{
							model: 'User',
							operation: 'count',
							filter: { filters: { status: 'active' } }
						}]
					}
				},
				groupByExample: {
					summary: 'GroupBy with aggregations',
					value: {
						models: [{
							model: 'Order',
							operation: 'groupBy',
							args: {
								by: ['status'],
								aggregations: { _sum: { amount: true } }
							},
							filter: {
								dateField: 'createdAt',
								startDate: '2023-01-01',
								endDate: '2023-12-31'
							}
						}]
					}
				},
				multiModel: {
					summary: 'Multi-model request',
					value: {
						models: [
							{
								model: 'User',
								operation: 'count',
								filter: { filters: { status: 'active' } }
							},
							{
								model: 'Product',
								operation: 'findMany',
								args: { take: 5 },
								filter: { search: 'phone', searchFields: ['name'] }
							}
						]
					}
				}
			}
		})
	)	
}