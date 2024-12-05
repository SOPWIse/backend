import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaginationService } from '@sopwise/common/pagination/pagination.service';
import { PrismaService } from '@sopwise/prisma/prisma.service';
import { SopController } from './sop.controller';
import { SopService } from './sop.service';

@Module({
  controllers: [SopController],
  providers: [SopService, PrismaService, PaginationService, ConfigService],
  imports: [],
})
export class SopModule {}
