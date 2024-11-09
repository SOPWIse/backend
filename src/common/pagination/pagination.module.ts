import { Module } from '@nestjs/common';
import { PaginationService } from '@sopwise/common/pagination/pagination.service';
import { PrismaModule } from '@sopwise/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PaginationService],
  exports: [PaginationService],
})
export class PaginationModule {}
