import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaginationService } from '@sopwise/common/pagination/pagination.service';
import { S3ClientFactory } from '@sopwise/modules/file-manager/aws/s3/s3.factory';
import { S3Service } from '@sopwise/modules/file-manager/aws/s3/s3.service';
import { FileManagerController } from '@sopwise/modules/file-manager/file-manager.controller';
import { R2ClientFactory } from '@sopwise/modules/file-manager/r2/r2.factory';
import { R2Service } from '@sopwise/modules/file-manager/r2/r2.service';
import { PrismaService } from '@sopwise/prisma/prisma.service';
import { FileManagerService } from './file-manager.service';

@Module({
  providers: [
    FileManagerService,
    ConfigService,
    R2ClientFactory,
    R2Service,
    S3Service,
    S3ClientFactory,
    PrismaService,
    PaginationService,
  ],
  exports: [FileManagerService],
  controllers: [FileManagerController],
})
export class FileManagerModule {}
