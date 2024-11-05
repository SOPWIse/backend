import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, SopWiseUser } from '@prisma/client';
import { PaginationQueryDto } from 'src/common/pagination/pagination.dto';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async createUser(
    email: string,
    name: string,
    hash: string,
    role: Role,
    provider?: string,
    metaData?: string,
  ) {
    try {
      const res = await this.prisma.sopWiseUser.create({
        data: {
          email,
          name,
          hash,
          role,
          provider: provider ?? 'sopwise',
          metaData,
        },
      });
      delete res.hash;
      return res;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.prisma.sopWiseUser.findUnique({
        where: { email },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to find user by email');
    }
  }

  async getCurrentUser(email: string) {
    try {
      return await this.prisma.sopWiseUser.findUnique({
        where: { email },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to find user by email');
    }
  }

  // async getAllUser(limit: number = 10, cursor?: string) {
  //   try {
  //     const queryOptions: any = {
  //       take: limit,
  //       orderBy: { id: 'asc' },
  //     };
  //     if (cursor) {
  //       queryOptions.skip = 1;
  //       queryOptions.cursor = { id: cursor };
  //     }
  //     const users = await this.prisma.sopWiseUser.findMany(queryOptions);
  //     const filteredUsers = users.map(({ hash, ...rest }) => rest);

  //     const baseUrl = '/users';
  //     const nextUrl =
  //       users.length === limit
  //         ? `${baseUrl}?cursor=${users[users.length - 1].id}`
  //         : null;
  //     const previousUrl = cursor ? `${baseUrl}?cursor=${users[0]?.id}` : null;

  //     return {
  //       data: filteredUsers,
  //       meta: {
  //         limit,
  //         next: nextUrl,
  //         previous: previousUrl,
  //       },
  //     };
  //   } catch (error) {
  //     throw new Error(`Failed to fetch users: ${error.message}`);
  //   }
  // }

  // In UserService:
  async getUsers(query: PaginationQueryDto) {
    return this.paginationService.paginate<SopWiseUser>('SopWiseUser', query, {
      id: true,
      email: true,
      name: true,
      role: true,
      provider: true,
      createdAt: true,
      updatedAt: true,
    });
  }
}
