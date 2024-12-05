import { Injectable } from '@nestjs/common';
import { Sop } from '@prisma/client';
import { PaginationQueryDto } from '@sopwise/common/pagination/pagination.dto';
import { PaginationService } from '@sopwise/common/pagination/pagination.service';
import { PrismaService } from '@sopwise/prisma/prisma.service';
import { CreateSop, sopSchema } from '@sopwise/types/sop.types';
import { handlePrismaError } from '@sopwise/utils/prisma-error-handler';

@Injectable()
export class SopService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

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
      return await this.prisma.sop.findFirst({
        where: { id },
      });
    } catch (e) {
      handlePrismaError(e);
    }
  }
  async listSop(query: PaginationQueryDto) {
    return await this.paginationService.paginate('Sop', query, {
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
    });
  }

  async approveOnId(id: string) {
    try {
      return await this.prisma.sop.update({
        where: { id },
        data: {
          isListed: true,
        },
      });
    } catch (e) {
      handlePrismaError(e);
    }
  }
}
