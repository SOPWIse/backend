import { Injectable } from '@nestjs/common';
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
    return this.prisma.sopWiseUser.create({
      data: {
        email,
        name,
        hash,
        role,
        provider,
        metaData,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.sopWiseUser.findUnique({
      where: { email },
    });
  }
}
