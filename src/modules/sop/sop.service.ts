import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Sop } from '@prisma/client';
import fileConverter from '@sopwise/common/file-converter/file-converter';
import { PaginationQueryDto } from '@sopwise/common/pagination/pagination.dto';
import { PaginationService } from '@sopwise/common/pagination/pagination.service';
import { ApprovalsService } from '@sopwise/modules/approvals/approvals.service';
import { CommentService } from '@sopwise/modules/comment/comment.service';
import { FileManagerService } from '@sopwise/modules/file-manager/file-manager.service';
import { PrismaService } from '@sopwise/prisma/prisma.service';
import { CreateComment } from '@sopwise/types/comment.types';
import { CreateSop, sopSchema } from '@sopwise/types/sop.types';
import { createParser } from '@sopwise/utils/content-parser';
import { handlePrismaError } from '@sopwise/utils/prisma-error-handler';

@Injectable()
export class SopService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
    private readonly approvalService: ApprovalsService,
    private readonly fileManager: FileManagerService,
    private readonly commentService: CommentService,
  ) {}

  private readonly select = {
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
    const getSop = await this.findById(id);
    if (!getSop) {
      throw new NotFoundException('SOP not found');
    }
    if (getSop.author.id !== body.authorId) {
      throw new ForbiddenException('You are not authorized to update this SOP');
    }
    return await this.prisma.sop.update({
      where: { id },
      data: sopSchema.parse(body),
    });
  }

  async updateFlowData(id: string, body: string | object) {
    return await this.prisma.sop.update({
      where: { id },
      data: {
        flowData: body,
      },
    });
  }

  async getFlowDataById(id: string) {
    const sop = await this.prisma.sop.findFirst({
      where: { id },
      select: { flowData: true },
    });
    return JSON.parse(sop.flowData as string) ?? [];
  }

  async findById(id: string) {
    try {
      const sop = await this.prisma.sop.findFirst({
        where: { id },
        select: { ...this.select, content: true, flowData: true },
      });
      const approval = await this.approvalService.findByContentId(id);
      const comments = await this.commentService.listCommentsByContentId(id);
      if (approval) {
        return { ...sop, approval, comments };
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
  //  Don't add try catch block in this function
  async uploadFile(id: string, authorId: string) {
    const content = await this.findById(id);
    const file = await fileConverter.generatePdfAsMulterFile(content.title, content.content);
    const data = {
      title: content.title,
      visibility: 'public',
      category: 'SOP',
      updatedAt: new Date(),
      createdAt: new Date(),
      file: file as any,
    };
    const { file: url } = await this.fileManager.uploadFileAws(data, authorId, file);
    return url;
  }

  async publishSop(id: string, authorId: string) {
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const url = await this.uploadFile(id, authorId);
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
              contentUrl: url,
            },
          });
        },
        { maxWait: 60000, timeout: 60000 },
      );
    } catch (e) {
      console.log('Error while publishing:', e);
      handlePrismaError(e);
    }
  }
  async getAuthorOfContent(id: string) {
    return (await this.findById(id)).author;
  }
  // When the SOP gets approved, this will update all the flags related to approval/Listings
  // this will also generate the flow data
  async approveOnId(id: string, userId: string) {
    const approval = await this.approvalService.findByContentId(id);
    const author = await this.getAuthorOfContent(id);

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
        const content = await trx.sop.findFirst({
          where: { id },
        });
        return await trx.sop.update({
          where: { id },
          data: {
            flowData: JSON.stringify(createParser.parse(content.content)),
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

  async patchContentCreateComment(id: string, content: string, comment: CreateComment) {
    return this.prisma.$transaction(async (trx) => {
      const approval = await trx.approval.findFirst({
        where: { contentId: id },
      });

      if (!approval) {
        throw new NotFoundException(
          'Ask the author to publish this SOP for review, then you will be able to add comment',
        );
      }
      const com = await this.commentService.createComment(comment);
      await trx.sop.update({
        where: { id },
        data: {
          content,
        },
      });
      return com;
    });
  }

  async patchContentResolveComment(id: string, commentId: string, content: string) {
    return this.prisma.$transaction(async (trx) => {
      const com = await this.commentService.editComment(commentId, {
        status: 'RESOLVED',
      });
      await trx.sop.update({
        where: { id },
        data: {
          content,
        },
      });
      return com;
    });
  }

  async findSopByUserId(userId: string) {
    return await this.prisma.sop.findMany({
      where: {
        authorId: userId,
      },
      select: this.select,
    });
  }
}
