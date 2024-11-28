import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PaginationService } from '@sopwise/common/pagination/pagination.service';
import { ApprovalsService } from '@sopwise/modules/approvals/approvals.service';
import { PrismaService } from '@sopwise/prisma/prisma.service';
import { ApprovalsController } from './approvals.controller';

@Module({
  controllers: [ApprovalsController],
  providers: [
    ConfigService,
    JwtService,
    PrismaService,
    PaginationService,
    ApprovalsService,
  ],
  exports: [ApprovalsService],
})
export class ApprovalsModule {}
