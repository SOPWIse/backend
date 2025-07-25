import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationQueryDto } from '@sopwise/common/pagination/pagination.dto';
import { BaseResponse, PaginationMeta } from '@sopwise/common/pagination/pagination.inteface';
import { PrismaService } from '@sopwise/prisma/prisma.service';

@Injectable()
export class PaginationService {
  constructor(private prisma: PrismaService) {}

  async paginate<T>(
    model: keyof typeof Prisma.ModelName,
    query: PaginationQueryDto,
    select?: Prisma.SelectSubset<any, any>,
  ): Promise<BaseResponse<{ data: T[]; meta: PaginationMeta }>> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        searchFields = [],
        sortBy = 'createdAt',
        sortOrder = 'desc',
        filter = {},
      } = query;

      // Validate model exists
      if (!this.prisma[model]) {
        throw new BadRequestException(`Invalid model: ${model}`);
      }

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = { ...filter };

      // Handle search
      if (search && searchFields.length > 0) {
        where.OR = searchFields.map((field) => {
          // Handle nested fields (e.g., 'address.city')
          const fields = field.split('.');
          const searchCondition: any = {};
          let current = searchCondition;

          fields.forEach((f, index) => {
            if (index === fields.length - 1) {
              current[f] = { contains: search, mode: 'insensitive' };
            } else {
              current[f] = {};
              current = current[f];
            }
          });

          return searchCondition;
        });
      }

      // Validate sortBy field exists in model
      const modelFields = Object.keys(Prisma[`${model}ScalarFieldEnum`]);
      if (!modelFields.includes(sortBy)) {
        throw new BadRequestException(`Invalid sort field: ${sortBy}`);
      }

      const [total, items] = await Promise.all([
        this.prisma[model].count({ where }),
        this.prisma[model].findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          select,
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          data: items,
          meta: {
            items: {
              totalItems: total,
              limit,
              begins: skip + 1,
              ends: Math.min(skip + limit, total),
            },
            page: {
              current: page,
              previous: page > 1 ? page - 1 : null,
              next: page < totalPages ? page + 1 : null,
              total: totalPages,
              size: limit,
            },
          },
        },
      };
    } catch (error) {
      console.error('PaginationService Error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to paginate data');
    }
  }
}
