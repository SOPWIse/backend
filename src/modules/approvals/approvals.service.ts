import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Approval, Status } from '@prisma/client';
import { PaginationQueryDto } from '@sopwise/common/pagination/pagination.dto';
import { PaginationService } from '@sopwise/common/pagination/pagination.service';
import { PrismaService } from '@sopwise/prisma/prisma.service';
import { CreateApproval } from '@sopwise/types/approval.types';

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pagination: PaginationService,
  ) {}

  async createApproval({
    allowedRole,
    approvedBy,
    contentId,
    description,
    requestedId,
    status,
  }: CreateApproval) {
    try {
      const requestedUser = await this.prisma.sopWiseUser.findUnique({
        where: { id: requestedId },
      });

      if (!requestedUser) {
        throw new NotFoundException('Requested user not found');
      }
      if (approvedBy) {
        const approvedByUser = await this.prisma.sopWiseUser.findUnique({
          where: { id: approvedBy },
        });

        if (!approvedByUser) {
          throw new NotFoundException('Approved by user not found');
        }
      }

      return this.prisma.approval.create({
        data: {
          requestedId: requestedId,
          description: description,
          status: status || Status.PENDING,
          approvedBy: approvedBy,
          contentId: contentId,
          allowedRole: allowedRole || [],
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to create approval');
    }
  }

  async updateApproval(id: string, data: Partial<CreateApproval>) {
    try {
      if (data.approvedBy) {
        const approvedByUser = await this.prisma.sopWiseUser.findUnique({
          where: { id: data.approvedBy },
        });

        if (!approvedByUser) {
          throw new NotFoundException('Approved by user not found');
        }
      }

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
      throw new BadRequestException('Failed to update approval');
    }
  }

  async listApprovals(query: PaginationQueryDto) {
    try {
      return this.pagination.paginate<Approval>('Approval', query, {
        requestedId: true,
        description: true,
        status: true,
        approvedBy: true,
        contentId: true,
        allowedRole: true,
      });
    } catch (error) {
      throw new BadRequestException('Failed to get approvals');
    }
  }
}
