import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { handlePrismaError } from '@sopwise/utils/prisma-error-handler';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get<string>('DATABASE_URL'),
        },
      },
    });
  }
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }

  async safeCreate<T, U>(model: keyof PrismaClient, data: U): Promise<T> {
    try {
      return await (this[model as keyof PrismaClient] as any).create({
        data,
      });
    } catch (error) {
      console.log('>>>>>>', error);
      handlePrismaError(error);
    }
  }
}
