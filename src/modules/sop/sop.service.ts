import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Sop } from '@prisma/client';
import { PaginationQueryDto } from '@sopwise/common/pagination/pagination.dto';
import { PaginationService } from '@sopwise/common/pagination/pagination.service';
import { ApprovalsService } from '@sopwise/modules/approvals/approvals.service';
import { PrismaService } from '@sopwise/prisma/prisma.service';
import { CreateSop, sopSchema } from '@sopwise/types/sop.types';
import { handlePrismaError } from '@sopwise/utils/prisma-error-handler';

@Injectable()
export class SopService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
    private readonly approvalService: ApprovalsService,
  ) {}

  select = {
    id: true,
    title: true,
    description: true,
    status: true,
    isListed: true,
    publishedAt: true,
    createdAt: true,
    updatedAt: true,
    contentUrl: true,
    author: {
      select: {
        id: true,
        email: true,
        name: true,
      },
    },
  };

  async createSop(body: CreateSop) {
    const request = sopSchema.parse(body);
    return await this.prisma.safeCreate<Sop, CreateSop>('sop', request);
  }

  async updateSop(id: string, body: Partial<CreateSop>) {
    return await this.prisma.sop.update({
      where: { id },
      data: body,
    });
  }

  async findById(id: string) {
    try {
      const sop = await this.prisma.sop.findFirst({
        where: { id },
        select: { ...this.select, content: true },
      });
      const approval = await this.approvalService.findByContentId(id);
      if (approval) {
        return { ...sop, approval };
      } else {
        return sop;
      }
    } catch (e) {
      handlePrismaError(e);
    }
  }
  async listSop(query: PaginationQueryDto) {
    return await this.paginationService.paginate('Sop', query, {
      ...this.select,
    });
  }

  async publishSop(id: string, authorId: string) {
    try {
      return await this.prisma.$transaction(async (transaction) => {
        await this.approvalService.createApproval({
          allowedRole: ['ADMIN'],
          authorId: authorId,
          contentId: id,
          description: 'Default',
          status: 'PENDING',
        });
        return await transaction.sop.update({
          where: { id },
          data: {
            status: 'PUBLISHED',
          },
        });
      });
    } catch (e) {
      handlePrismaError(e);
    }
  }
  async getAuthorOfContent(id: string) {
    return (await this.findById(id)).author;
  }

  async approveOnId(id: string, userId: string) {
    const approval = await this.approvalService.findByContentId(id);
    const author = await this.getAuthorOfContent(id);

    console.log({ author, userId });
    if (!approval) {
      throw new NotFoundException('Content is not submitted for approval');
    } else if (author.id === userId) {
      throw new ForbiddenException("Author can't approve");
    }
    try {
      return this.prisma.$transaction(async (trx) => {
        await this.approvalService.updateApproval(approval.id, {
          status: 'APPROVED',
          approvedBy: userId,
        });
        return trx.sop.update({
          where: { id },
          data: {
            status: 'LISTED',
            isListed: true,
          },
        });
      });
    } catch (e) {
      handlePrismaError(e);
    }
  }

  async rejectOnId(id: string, userId: string) {
    const approval = await this.approvalService.findByContentId(id);
    const author = await this.getAuthorOfContent(id);
    if (!approval) {
      throw new NotFoundException('Content is not submitted for approval');
    } else if (author.id === userId) {
      throw new ForbiddenException("Author can't reject");
    }
    try {
      return this.prisma.$transaction(async (trx) => {
        await this.approvalService.updateApproval(approval.id, {
          status: 'REJECTED',
          approvedBy: userId,
        });
        return trx.sop.update({
          where: { id },
          data: {
            status: 'REJECTED',
            isListed: false,
          },
        });
      });
    } catch (e) {
      handlePrismaError(e);
    }
  }
}
