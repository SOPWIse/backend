import { Module } from '@nestjs/common';
import { PaginationService } from '@sopwise/common/pagination/pagination.service';
import { S3ClientFactory } from '@sopwise/modules/file-manager/aws/s3/s3.factory';
import { S3Service } from '@sopwise/modules/file-manager/aws/s3/s3.service';
import { FileManagerService } from '@sopwise/modules/file-manager/file-manager.service';
import { R2ClientFactory } from '@sopwise/modules/file-manager/r2/r2.factory';
import { R2Service } from '@sopwise/modules/file-manager/r2/r2.service';
import { PrismaService } from '@sopwise/prisma/prisma.service';
import { ExperimentLogsController } from './experiment-logs.controller';
import { ExperimentLogsService } from './experiment-logs.service';

@Module({
  controllers: [ExperimentLogsController],
  providers: [
    ExperimentLogsService,
    PrismaService,
    PaginationService,
    FileManagerService,
    R2Service,
    S3Service,
    R2ClientFactory,
    S3ClientFactory,
  ],
})
export class ExperimentLogsModule {}
