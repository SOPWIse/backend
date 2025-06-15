import { Injectable } from "@nestjs/common";
import { buildGenericWhere } from "@sopwise/modules/analytics/analytics.utls";
import { ModelAnalyticsRequest, MultiModelAnalytics, SopwiseAnalyticsFilter } from "@sopwise/modules/analytics/dto/analytics.dto";
import { PrismaService } from "@sopwise/prisma/prisma.service";


// startDate, endDate formatting = "YYYY-MM-DD"
// {
//   "models": [
//     {
//       "model": "Sop",
//       "operation": "count",
//       "filter": {
// 				"filters": {"isListed": true, "isDeleted": false}
//       }
//     },
//     {
//       "model": "SopWiseUser",
//       "operation": "count"
//     },
//     {
//       "model": "ExperimentLog",
//       "operation": "count"
//     },
// 		{
// 			"model": "ExperimentLog",
//       "operation": "aggregate",
// 			"args": {
// 				"includeCount": true,
// 				"fields": {
// 					"avg": ["total_time", "completion_percentage"]
// 				}
// 			}
// 		},
// 		{
// 			"model": "experimentLog",
// 			"operation": "groupBy",
// 			"args": {
// 				"by": ["userId"],
// 				"aggregations": {
// 					"_count": {
// 						"_all": true
// 					}
// 				},
// 				"orderBy": {
// 					"_count": {
// 						"userId": "desc"
// 					}
// 				}
// 			}
// 		}
//   ]
// }



@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async runAnalytics(dto: MultiModelAnalytics): Promise<any> {
    const results = await Promise.all(
      dto.models.map((modelReq) => this.processModelRequest(modelReq))
    );

    return results;
  }

  private async processModelRequest(modelReq: ModelAnalyticsRequest) {
    const { model, operation, args = {}, filter = {} } = modelReq;
    const where = buildGenericWhere(filter, model);

    switch (operation) {
      case 'count':
        return this.handleCount(model, where);
      case 'findMany':
        return this.handleFindMany(model, where, args.take);
      case 'groupBy':
        return this.handleGroupBy(model, where, args.by, args.aggregations, args.orderBy);
      case 'aggregate':
        return this.handleAggregate(model, where, args.fields);
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }

  private async handleCount(model: string, where: any) {
    const result = await this.prisma[model].count({ where });
    return { model, operation: 'count', result };
  }

  private async handleFindMany(model: string, where: any, take = 100) {
    const result = await this.prisma[model].findMany({ where, take });
    return { model, operation: 'findMany', result };
  }

  private async handleGroupBy(
    model: string,
    where: any,
    by?: string[],
    aggregations?: Record<string, any>,
    orderBy?: any
  ) {
    if (!by || by.length === 0) {
      throw new Error(`Missing 'by' fields for groupBy on ${model}`);
    }

    const groupByArgs: any = {
      by,
      where,
      ...aggregations,
    };

    if (orderBy) {
      groupByArgs.orderBy = orderBy;
    }

    if (!aggregations || Object.keys(aggregations).length === 0) {
      groupByArgs._count = true;
    }

    const rawResults = await this.prisma[model].groupBy(groupByArgs);

    const formattedResults = rawResults.map((row) => {
      const flatRow: Record<string, any> = {};
      for (const [key, value] of Object.entries(row)) {
        if (typeof value === 'object' && value !== null) {
          for (const [subKey, subValue] of Object.entries(value)) {
            flatRow[`${key.slice(1)}_${subKey}`] = subValue;
          }
        } else {
          flatRow[key] = value;
        }
      }
      return flatRow;
    });

    return {
      model,
      operation: 'groupBy',
      result: formattedResults,
    };
  }



  private async handleAggregate(
  model: string,
  where: any,
  fields?: { sum?: string[]; avg?: string[]; min?: string[]; max?: string[]; count?: string[] },
) {
  if (!fields) {
    throw new Error(`Missing 'fields' for aggregate on ${model}`);
  }

  const aggregateArgs: any = { where };
  const { sum, avg, min, max, count } = fields;

  if (sum?.length) {
    aggregateArgs._sum = Object.fromEntries(sum.map((f) => [f, true]));
  }
  if (avg?.length) {
    aggregateArgs._avg = Object.fromEntries(avg.map((f) => [f, true]));
  }
  if (min?.length) {
    aggregateArgs._min = Object.fromEntries(min.map((f) => [f, true]));
  }
  if (max?.length) {
    aggregateArgs._max = Object.fromEntries(max.map((f) => [f, true]));
  }
  

  const hasSomething =
    aggregateArgs._sum ||
    aggregateArgs._avg ||
    aggregateArgs._min ||
    aggregateArgs._max
   

  if (!hasSomething) {
    throw new Error(
      `No valid aggregate fields provided for model ${model}: ${JSON.stringify(fields)}`
    );
  }

  console.log(`Running aggregate on model: ${model}`, JSON.stringify(aggregateArgs, null, 2));

  const rawResult = await this.prisma[model].aggregate(aggregateArgs);
  const formattedResult: Record<string, any> = {};
  // Find distinct count for the _count field
  if(count && count.length > 0) {
    const countRes = await this.prisma[model].groupBy({
      by: [...count],
      where,
    });
    formattedResult.count = countRes.length;
  }

  for (const key of Object.keys(rawResult)) {
    const metric = rawResult[key]; 
    for (const field of Object.keys(metric)) {
      if( field === '_all'){
        formattedResult[`${key.slice(1)}_all`] = metric[field];
        continue; 
      };
      formattedResult[`${key.slice(1)}_${field}`] = metric[field];
    }
  }

  return {
    model,
    operation: 'aggregate',
    result: formattedResult,
  };
  }


  async topActiveUsers(filter: SopwiseAnalyticsFilter) {
    const where = buildGenericWhere(filter || {});

    
    const topUsers = await this.prisma.experimentLog.groupBy({
      by: ['userId'],
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: 5,
      where: where 
    });

    // return topUsers

    if (!topUsers || topUsers.length === 0) {
      return [];
    }

    const userIds = topUsers.map(user => user.userId);

    
    const [
      pendingExp,
      completedExp,
      avgCompletionTime,
      userDetails,
      userLogs
    ] = await Promise.all([
      
      this.prisma.experimentLog.groupBy({
        by: ['userId'],
        _count: { userId: true },
        where: {
          userId: { in: userIds },
          completion_percentage: { lt: 100 },
          ...where
        }
      }),
      
      this.prisma.experimentLog.groupBy({
        by: ['userId'],
        _count: { userId: true },
        where: {
          userId: { in: userIds },
          completion_percentage: { equals: 100 },
          ...where
        }
      }),
      
      this.prisma.experimentLog.groupBy({
        by: ['userId'],
        _avg: { total_time: true },
        where: {
          userId: { in: userIds },
          completion_percentage: { equals: 100 },
          ...where
        }
      }),
      
      this.prisma.sopWiseUser.findMany({
        where: { id: { in: userIds } },
        select: { id: true, email: true, name: true }
      }),
      
      this.prisma.experimentLog.findMany({
        select: { userId: true, sopId: true },
        where: { userId: { in: userIds }, ...where },
        distinct: ['userId', 'sopId'] 
      })
    ]);

    
    const userMap = new Map(userDetails.map(user => [user.id, user]));

    
    const uniqueSopCounts = userLogs.reduce((acc, log) => {
      if (!acc[log.userId]) acc[log.userId] = new Set();
      acc[log.userId].add(log.sopId);
      return acc;
    }, {} as Record<string, Set<string>>);

    
    return topUsers.map(row => {
      const userId = row.userId;
      const user = userMap.get(userId);
      
      return {
        userId,
        numberOfExp: row._count.userId,
        pendingExp: pendingExp.find(p => p.userId === userId)?._count.userId || 0,
        completedExp: completedExp.find(p => p.userId === userId)?._count.userId || 0,
        avgCompletionTime: avgCompletionTime.find(p => p.userId === userId)?._avg.total_time || 0,
        uniqueSopCount: uniqueSopCounts[userId]?.size || 0,
        userEmail: user?.email || null,
        userName: user?.name || null,
      };
    });
}

  

}
