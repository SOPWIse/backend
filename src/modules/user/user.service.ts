import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SopWiseUser } from '@prisma/client';

import { PaginationQueryDto } from '@sopwise/common/pagination/pagination.dto';
import { PaginationService } from '@sopwise/common/pagination/pagination.service';
import { PersonalInfoDto } from '@sopwise/modules/auth/dto/auth.dto';
import { UpdateUserDto } from '@sopwise/modules/auth/dto/auth.update-user-dto';
import { PrismaService } from '@sopwise/prisma/prisma.service';
import { Register } from '@sopwise/types/auth.types';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async createUser(body: Register & { hash: string }) {
    const {
      email,
      name,
      role,
      hash,
      provider,
      metaData,
      companyName,
      designation,
      department,
      profilePicture,
      country,
      phoneNumber,
    } = body;

    const res = await this.prisma.safeCreate<SopWiseUser, Prisma.SopWiseUserCreateInput>('sopWiseUser', {
      email,
      name,
      hash,
      role,
      provider: provider ?? 'sopwise',
      metaData,
      companyName,
      designation,
      department,
      profilePicture,
      country,
      phoneNumber,
    });
    delete res.hash;
    return res;
  }

  async findByEmail(email: string) {
    try {
      return await this.prisma.sopWiseUser.findUnique({
        where: { email },
      });
    } catch (error) {
      throw new NotFoundException('Failed to find user by email');
    }
  }

  async getCurrentUser(email: string) {
    try {
      return await this.prisma.sopWiseUser.findUnique({
        where: { email },
      });
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Failed to find user by email');
    }
  }

  async getUserById(id: string) {
    try {
      const res = await this.prisma.sopWiseUser.findUnique({
        where: { id },
      });
      delete res.hash;
      return res;
    } catch (e) {
      throw new NotFoundException("User doesn't exist");
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.sopWiseUser.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    const res = await this.prisma.sopWiseUser.update({
      where: { id },
      data: updateUserDto,
    });
    delete res.hash;
    return res;
  }

  async updatePersonalInfo(id: string, personalInfoDto: PersonalInfoDto) {
    const user = await this.prisma.sopWiseUser.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    const res = await this.prisma.sopWiseUser.update({
      where: { id },
      data: personalInfoDto,
    });
    delete res.hash;
    return res;
  }

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

  async getUsersByIds(ids: string[]) {
    return this.prisma.sopWiseUser.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
