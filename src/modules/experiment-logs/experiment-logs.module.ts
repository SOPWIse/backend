import { Module } from '@nestjs/common';
import { PrismaService } from '@sopwise/prisma/prisma.service';
import { ExperimentLogsController } from './experiment-logs.controller';
import { ExperimentLogsService } from './experiment-logs.service';

@Module({
  controllers: [ExperimentLogsController],
  providers: [ExperimentLogsService, PrismaService],
})
export class ExperimentLogsModule {}
