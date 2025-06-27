import { Injectable } from '@nestjs/common';
import { Approval, Status } from '@prisma/client';
import { PaginationQueryDto } from '@sopwise/common/pagination/pagination.dto';
import { PaginationService } from '@sopwise/common/pagination/pagination.service';
import { PrismaService } from '@sopwise/prisma/prisma.service';
import { CreateApproval } from '@sopwise/types/approval.types';
import { handlePrismaError } from '@sopwise/utils/prisma-error-handler';

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pagination: PaginationService,
  ) {}

  async createApproval({ allowedRole, approvedBy, contentId, description, authorId, status }: CreateApproval) {
    return this.prisma.safeCreate<Approval, CreateApproval>('approval', {
      authorId: authorId,
      description: description,
      status: status || Status.PENDING,
      approvedBy: approvedBy,
      contentId: contentId,
      allowedRole: allowedRole || [],
    });
  }

  async updateApproval(id: string, data: Partial<CreateApproval>) {
    try {
      return this.prisma.approval.update({
        where: { id },
        data: {
          description: data.description,
          status: data.status,
          approvedBy: data.approvedBy,
          allowedRole: data.allowedRole,
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findById(id: string) {
    try {
      return await this.prisma.approval.findFirst({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findByContentId(contentId: string) {
    try {
      return await this.prisma.approval.findFirst({
        where: { contentId },
        select: {
          contentId: true,
          createdAt: true,
          updatedAt: true,
          status: true,
          id: true,
          approvedByUser: {
            select: {
              email: true,
              name: true,
              id: true,
            },
          },
        },
      });
    } catch (error) {
      return null;
    }
  }

  async listApprovals(query: PaginationQueryDto) {
    try {
      return this.pagination.paginate<Approval>('Approval', query, {
        authorId: true,
        description: true,
        status: true,
        approvedBy: true,
        contentId: true,
        allowedRole: true,
        approvedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        requestedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
