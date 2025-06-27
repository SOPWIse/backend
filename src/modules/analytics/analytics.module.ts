import { Module } from '@nestjs/common';
import { AnalyticsService } from '@sopwise/modules/analytics/analytics.service';
import { PrismaService } from '@sopwise/prisma/prisma.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  providers: [AnalyticsService, PrismaService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
