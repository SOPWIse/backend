import { Injectable } from '@nestjs/common';
import { buildGenericWhere } from '@sopwise/modules/analytics/analytics.utls';
import { PrismaService } from '@sopwise/prisma/prisma.service';
import { ModelAnalyticsRequest, MultiModelAnalytics, SopwiseAnalyticsFilter } from '@sopwise/types/analytics.types';


@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async runAnalytics(dto: MultiModelAnalytics): Promise<any> {
    const results = await Promise.all(dto.models.map((modelReq) => this.processModelRequest(modelReq)));
    return results;
  }

  private async processModelRequest(modelReq: ModelAnalyticsRequest) {
    const { model, filter = {} } = modelReq;
    const where = buildGenericWhere(filter, model);

    switch (modelReq.operation) {
      case 'count':
        return this.handleCount(model, where);
      case 'findMany': {
        const take = modelReq.args?.take ?? 100;
        return this.handleFindMany(model, where, take);
      }
      case 'groupBy': {
        const { by, aggregations, orderBy } = modelReq.args;
        return this.handleGroupBy(model, where, by, aggregations, orderBy);
      }
      case 'aggregate': {
        return this.handleAggregate(model, where, modelReq.args.fields);
      }
      default:
        throw new Error(`Unsupported operation`);
    }
  }

  private async handleCount(model: string, where: any) {
    const result = await this.prisma[model].count({ where });
    return { model, operation: 'count', result };
  }

  private async handleFindMany(model: string, where: any, take?: number) {
    if (take) {
      const result = await this.prisma[model].findMany({ where, take });
      return { model, operation: 'findMany', result };
    }
    const result = await this.prisma[model].findMany({ where });
    return { model, operation: 'findMany', result };
  }

  private async handleGroupBy(
    model: string,
    where: any,
    by?: string[],
    fields?: {
      count?: boolean | string[];
      sum?: string[];
      avg?: string[];
      min?: string[];
      max?: string[];
    },
    orderBy?: any,
  ) {
    if (!by || by.length === 0) {
      throw new Error(`Missing 'by' fields for groupBy on ${model}`);
    }

    const groupByArgs: any = {
      by,
      where,
    };

    if (orderBy) {
      groupByArgs.orderBy = orderBy;
    }

    if (fields) {

      if (fields.count) {
        if (typeof fields.count === 'boolean') {
          groupByArgs._count = true;
        } else if (fields.count.length > 0) {
          groupByArgs._count = Object.fromEntries(fields.count.map((field) => [field, true]));
        }
      }


      if (fields.sum?.length) {
        groupByArgs._sum = Object.fromEntries(fields.sum.map((field) => [field, true]));
      }


      if (fields.avg?.length) {
        groupByArgs._avg = Object.fromEntries(fields.avg.map((field) => [field, true]));
      }


      if (fields.min?.length) {
        groupByArgs._min = Object.fromEntries(fields.min.map((field) => [field, true]));
      }


      if (fields.max?.length) {
        groupByArgs._max = Object.fromEntries(fields.max.map((field) => [field, true]));
      }
    }

    if (!fields || Object.keys(groupByArgs).filter((k) => k.startsWith('_')).length === 2) {
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

    const hasSomething = aggregateArgs._sum || aggregateArgs._avg || aggregateArgs._min || aggregateArgs._max;

    if (!hasSomething) {
      throw new Error(`No valid aggregate fields provided for model ${model}: ${JSON.stringify(fields)}`);
    }

    const rawResult = await this.prisma[model].aggregate(aggregateArgs);
    const formattedResult: Record<string, any> = {};

    if (count && count.length > 0) {
      const countRes = await this.prisma[model].groupBy({
        by: [...count],
        where,
      });
      formattedResult.count = countRes.length;
    }

    for (const key of Object.keys(rawResult)) {
      const metric = rawResult[key];
      for (const field of Object.keys(metric)) {
        if (field === '_all') {
          formattedResult[`${key.slice(1)}_all`] = metric[field];
          continue;
        }
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
      where: where,
    });

    // return topUsers

    if (!topUsers || topUsers.length === 0) {
      return [];
    }

    const userIds = topUsers.map((user) => user.userId);

    const [pendingExp, completedExp, avgCompletionTime, userDetails, userLogs] = await Promise.all([
      this.prisma.experimentLog.groupBy({
        by: ['userId'],
        _count: { userId: true },
        where: {
          userId: { in: userIds },
          completion_percentage: { lt: 100 },
          ...where,
        },
      }),

      this.prisma.experimentLog.groupBy({
        by: ['userId'],
        _count: { userId: true },
        where: {
          userId: { in: userIds },
          completion_percentage: { equals: 100 },
          ...where,
        },
      }),

      this.prisma.experimentLog.groupBy({
        by: ['userId'],
        _avg: { total_time: true },
        where: {
          userId: { in: userIds },
          completion_percentage: { equals: 100 },
          ...where,
        },
      }),

      this.prisma.sopWiseUser.findMany({
        where: { id: { in: userIds } },
        select: { id: true, email: true, name: true },
      }),

      this.prisma.experimentLog.findMany({
        select: { userId: true, sopId: true },
        where: { userId: { in: userIds }, ...where },
        distinct: ['userId', 'sopId'],
      }),
    ]);

    const userMap = new Map(userDetails.map((user) => [user.id, user]));

    const uniqueSopCounts = userLogs.reduce((acc, log) => {
      if (!acc[log.userId]) acc[log.userId] = new Set();
      acc[log.userId].add(log.sopId);
      return acc;
    }, {} as Record<string, Set<string>>);

    return topUsers.map((row) => {
      const userId = row.userId;
      const user = userMap.get(userId);

      return {
        userId,
        numberOfExp: row._count.userId,
        pendingExp: pendingExp.find((p) => p.userId === userId)?._count.userId || 0,
        completedExp: completedExp.find((p) => p.userId === userId)?._count.userId || 0,
        avgCompletionTime: avgCompletionTime.find((p) => p.userId === userId)?._avg.total_time || 0,
        uniqueSopCount: uniqueSopCounts[userId]?.size || 0,
        userEmail: user?.email || null,
        userName: user?.name || null,
      };
    });
  }
}
