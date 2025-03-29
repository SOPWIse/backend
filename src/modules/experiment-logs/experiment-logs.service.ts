import { Injectable } from '@nestjs/common';
import { ExperimentLog, Step } from '@prisma/client';
import { PaginationQueryDto } from '@sopwise/common/pagination/pagination.dto';
import { PaginationService } from '@sopwise/common/pagination/pagination.service';
import { PrismaService } from '@sopwise/prisma/prisma.service';
import { ExperimentLogSchema, StepSchema, UpdateLogSchema } from '@sopwise/types/experiment-logs.types';
@Injectable()
export class ExperimentLogsService {
  constructor(private readonly prismaService: PrismaService, private readonly pagination: PaginationService) {}

  selector = {
    id: true,
    completion_percentage: true,
    createdAt: true,
    meta_data: true,
    sopId: true,
    status: true,
    updatedAt: true,
    tenant: true,
    total_time: true,
    userId: true,
    steps: true,
  };

  async getLogsByUserAndSop(userId: string, sopId: string) {
    const logs = await this.prismaService.experimentLog.findFirst({
      where: {
        userId,
        sopId,
      },
      select: this.selector,
    });

    return logs;
  }

  async createLog(body: ExperimentLogSchema) {
    // const isExisting = await this.getLogsByUserAndSop(body.userId, body.sopId);
    // if (isExisting) {
    //   return isExisting;
    // }
    // CHECK THIS
    if (body.id) {
      const obj = await this.updateLogs(body.id, body);
      return obj;
    }

    return this.prismaService.safeCreate<ExperimentLog, ExperimentLogSchema>('experimentLog', body);
  }

  async createStepOnLogId(step: StepSchema) {
    return this.prismaService.safeCreate<Step, StepSchema>('step', step);
  }

  // TODO : HOW WILL THE WE SEARCH BY SOP NAME/ USER NAME IF ITS NOT PART OF EXPERIMENT LOG
  async getAllLogs(query: PaginationQueryDto) {
    const logs = await this.pagination.paginate<ExperimentLog>('ExperimentLog', query, { ...this.selector });

    if (!logs?.data?.data) return logs;

    const sopData = await Promise.all(
      logs.data.data.map(async (ele) => {
        const sop = await this.prismaService.sop.findFirst({
          where: { id: ele?.sopId },
          select: { title: true, description: true, id: true },
        });
        const user = await this.prismaService.sopWiseUser.findFirst({
          where: { id: ele?.userId },
          select: { name: true, email: true, id: true },
        });
        return { ...ele, sop, user };
      }),
    );

    logs.data.data = sopData;

    return logs;
  }

  async updateLogs(logId: string, body: UpdateLogSchema) {
    const { steps, id, ...data } = body;
    const stepsToUpdate = steps
      .filter((step) => step.id)
      .map((step) => {
        // Remove logId from the update payload if present
        const { logId, ...updateData } = step;
        return {
          where: { id: step.id },
          data: { ...updateData, updatedAt: new Date() },
        };
      });
    const stepsToCreate = steps
      .filter((step) => !step.id)
      .map((step) => {
        // Remove logId from the create payload if present
        const { logId, ...createData } = step;
        return {
          ...createData,
          createdAt: new Date(),
        };
      });
    return this.prismaService.experimentLog.update({
      where: { id: logId },
      data: {
        ...data,
        steps: {
          update: stepsToUpdate,
          create: stepsToCreate,
        },
        updatedAt: new Date(),
      },
      select: this.selector,
    });
  }

  async getPDFReport(id: string) {}

  async deleteLog(id: string) {
    return this.prismaService.experimentLog.delete({ where: { id } });
  }

  async getLogById(id: string) {
    return this.prismaService.experimentLog.findFirst({ where: { id }, select: this.selector });
  }

  async getLogsBySopId(sopId: string) {
    return this.prismaService.experimentLog.findMany({ where: { sopId }, select: this.selector });
  }

  async getStepsByLogId(logId: string) {
    return this.prismaService.step.findMany({ where: { logId } });
  }

  async getStepById(id: string) {
    return this.prismaService.step.findUnique({ where: { id } });
  }

  async getLogByUserId(id: string) {
    return this.prismaService.experimentLog.findMany({ where: { userId: id } });
  }
}
