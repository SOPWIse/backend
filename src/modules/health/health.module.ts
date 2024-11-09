import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HealthService } from './health.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [TerminusModule, PrismaModule],
  providers: [HealthService],
  controllers: [HealthController],
})
export class HealthModule {}
