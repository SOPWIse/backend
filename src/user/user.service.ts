import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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
}
