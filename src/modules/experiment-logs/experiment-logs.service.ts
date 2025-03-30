import { Injectable } from '@nestjs/common';
import { ExperimentLog, Step } from '@prisma/client';
import { PaginationQueryDto } from '@sopwise/common/pagination/pagination.dto';
import { PaginationService } from '@sopwise/common/pagination/pagination.service';
import { generateSopLogPdf } from '@sopwise/modules/experiment-logs/utils/pdf-report-generator';
import { FileManagerService } from '@sopwise/modules/file-manager/file-manager.service';
import { IFileBody } from '@sopwise/modules/file-manager/types';
import { PrismaService } from '@sopwise/prisma/prisma.service';
import { ExperimentLogSchema, StepSchema, UpdateLogSchema } from '@sopwise/types/experiment-logs.types';
@Injectable()
export class ExperimentLogsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pagination: PaginationService,
    private readonly fileManager: FileManagerService,
  ) {}

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
    url: true,
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
    const logs = await this.pagination.paginate<ExperimentLog>('ExperimentLog', query, {
      ...this.selector,
      steps: false,
    });

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
    const total_time = steps?.reduce((pe, ce) => pe + ce?.time_taken, 0);
    return this.prismaService.experimentLog.update({
      where: { id: logId },
      data: {
        ...data,
        total_time: total_time,
        steps: {
          update: stepsToUpdate,
          create: stepsToCreate,
        },
        updatedAt: new Date(),
      },
      select: this.selector,
    });
  }

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

  private async uploadFile({ file, user_id, audit_id }: { file: any; user_id: string; audit_id: string }) {
    const { file: url } = await this.fileManager.uploadFileAws(
      {
        createdAt: new Date(),
        file: file as any,
        title: `audit-log-${audit_id}`,
        visibility: 'public',
        updatedAt: new Date(),
      },
      user_id,
      file as IFileBody,
    );

    return url;
  }

  async getPDFReport(id: string) {
    try {
      return this.prismaService.$transaction(
        async (trx) => {
          const experimentLog = await trx.experimentLog.findFirst({
            where: { id },
            select: this.selector,
          });
          if (experimentLog.url) return { url: experimentLog.url };
          const sop = await trx.sop.findFirst({
            where: { id: experimentLog.sopId },
            select: { title: true, description: true, id: true },
          });
          const userOnExp = await trx.sopWiseUser.findFirst({
            where: { id: experimentLog.userId },
            select: { name: true, email: true, id: true },
          });

          const final = { ...experimentLog, sopName: sop.title, authorName: userOnExp.name };
          if (final) {
            const file = await generateSopLogPdf(final);
            const url = await this.uploadFile({
              file,
              user_id: userOnExp.id,
              audit_id: experimentLog.id,
            });
            await trx.experimentLog.update({
              where: { id },
              data: { url },
            });

            return { url };
          }
          return null;
        },
        {
          timeout: 60000,
        },
      );
    } catch (error) {
      console.log(error);
      throw new Error('Something went wrong while generating the report, please try again later');
    }
  }
}
