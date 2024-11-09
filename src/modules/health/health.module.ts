import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from '@sopwise/modules/health/health.controller';
import { HealthService } from '@sopwise/modules/health/health.service';
import { PrismaModule } from '@sopwise/prisma/prisma.module';

@Module({
  imports: [TerminusModule, PrismaModule],
  providers: [HealthService],
  controllers: [HealthController],
})
export class HealthModule {}
