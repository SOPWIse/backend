import { Module } from '@nestjs/common';
import { PaginationService } from '@sopwise/common/pagination/pagination.service';
import { PrismaService } from '@sopwise/prisma/prisma.service';
import { ExperimentLogsController } from './experiment-logs.controller';
import { ExperimentLogsService } from './experiment-logs.service';

@Module({
  controllers: [ExperimentLogsController],
  providers: [ExperimentLogsService, PrismaService, PaginationService],
})
export class ExperimentLogsModule {}
