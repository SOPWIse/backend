// health.service.ts
import { Injectable } from '@nestjs/common';
import { HealthCheckResponse } from './health.types';
import { PrismaService } from '@sopwise/prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async check(): Promise<HealthCheckResponse> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        db: {
          status: 'up',
          connection: this.maskConnectionString(process.env.DATABASE_URL),
        },
      };
    } catch (error) {
      return {
        db: {
          status: 'down',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private maskConnectionString(connectionString: string | undefined): string {
    if (!connectionString) return 'unknown';
    return connectionString.replace(/:\/\/.*@/, '://****@:');
  }
}
