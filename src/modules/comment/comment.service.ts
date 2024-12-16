import { Injectable } from '@nestjs/common';
import { Comment } from '@prisma/client';
import { PrismaService } from '@sopwise/prisma/prisma.service';
import { CreateComment } from '@sopwise/types/comment.types';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}

  async createComment(body: CreateComment) {
    console.log(JSON.stringify(body, null, 2));
    return this.prismaService.safeCreate<Comment, CreateComment>('comment', {
      authorId: body?.authorId,
      comment: body?.comment,
      status: body?.status,
      contentId: body?.contentId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      parentId: body?.parentId,
    });
  }

  async editComment(id: string, body: Partial<CreateComment>) {
    return this.prismaService.comment.update({
      data: body,
      where: { id },
    });
  }

  async softDelete(id: string) {
    return this.prismaService.comment.update({
      data: {
        isDeleted: true,
      },
      where: { id },
    });
  }

  async deleteComment(id: string) {
    return this.prismaService.comment.delete({
      where: { id },
    });
  }

  async listCommentsByContentId(contentId: string) {
    return this.prismaService.comment.findMany({
      where: { contentId, parentId: null, isDeleted: false },
      select: {
        replies: {
          select: {
            comment: true,
            createdAt: true,
            updatedAt: true,
            id: true,
            author: {
              select: {
                email: true,
                id: true,
                name: true,
              },
            },
          },
        },
        comment: true,
        createdAt: true,
        updatedAt: true,
        id: true,
        author: {
          select: {
            email: true,
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async listCommentById(id: string) {
    return this.prismaService.comment.findMany({
      where: { id },
    });
  }
}
