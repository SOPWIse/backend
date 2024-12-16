import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@sopwise/prisma/prisma.service';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  providers: [CommentService, ConfigService, PrismaService],
  controllers: [CommentController],
})
export class CommentModule {}
