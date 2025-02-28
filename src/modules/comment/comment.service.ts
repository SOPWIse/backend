import { Injectable } from '@nestjs/common';
import { Comment } from '@prisma/client';
import { PrismaService } from '@sopwise/prisma/prisma.service';
import { CreateComment } from '@sopwise/types/comment.types';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}

  private author = {
    select: {
      email: true,
      id: true,
      name: true,
    },
  };
  private comment = {
    comment: true,
    createdAt: true,
    updatedAt: true,
    id: true,
    author: this.author,
    status: true,
    selectedText: true,
    htmlString: true,
    uniqueId: true,
    parentId: true,
  };

  async createComment(body: CreateComment) {
    return this.prismaService.safeCreate<Comment, CreateComment>('comment', {
      authorId: body?.authorId,
      comment: body?.comment,
      status: body?.status,
      contentId: body?.contentId,
      htmlString: body?.htmlString,
      selectedText: body?.selectedText,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
      parentId: body?.parentId,
      uniqueId: body?.uniqueId ?? '',
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
    const data = this.prismaService.comment.findMany({
      where: { contentId, parentId: null, isDeleted: false },
      select: {
        ...this.comment,
        replies: {
          select: { ...this.comment },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return data;
  }

  async listCommentById(id: string) {
    return this.prismaService.comment.findMany({
      where: { id },
    });
  }
}
