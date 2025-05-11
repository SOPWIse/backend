import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role, SopWiseUser } from '@prisma/client';
import { JwtAuthGuard } from '@sopwise/modules/auth/guard/jwt.guard';
import { CommentService } from '@sopwise/modules/comment/comment.service';
import { CreateCommentDto } from '@sopwise/modules/comment/dto/create.dto';
import { GetCurrentUser } from '@sopwise/modules/user/decorator/current-user.decorator';
import { Roles } from '@sopwise/roles/roles.decorator';
import { RolesGuard } from '@sopwise/roles/roles.guard';

@Controller('comment')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SCIENTIST, Role.AUTHOR, Role.VP, Role.ADMIN)
export class CommentController {
  constructor(private readonly comment: CommentService) {}

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  async createComment(@Body() body: CreateCommentDto, @GetCurrentUser() user: SopWiseUser) {
    return this.comment.createComment({
      authorId: user?.id,
      ...body,
    });
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  async updateComment(@Param('id') id: string, @Body() body: Partial<CreateCommentDto>) {
    return this.comment.editComment(id, {
      ...body,
    });
  }

  @Get('/:content_id')
  @HttpCode(HttpStatus.OK)
  async getCommentByContentId(@Param('content_id') id: string) {
    return this.comment.listCommentsByContentId(id);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.comment.deleteComment(id);
  }
}
