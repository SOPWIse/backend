import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@sopwise/prisma/prisma.service';
import { SopUploadController } from './sop-upload.controller';
import { SopUploadService } from './sop-upload.service';

@Module({
  controllers: [SopUploadController],
  providers: [SopUploadService, PrismaService, ConfigService],
})
export class SopUploadModule {}
