import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role, SopWiseUser } from '@prisma/client';
import { PaginationQueryDto } from '@sopwise/common/pagination/pagination.dto';
import { ApprovalsService } from '@sopwise/modules/approvals/approvals.service';
import {
  CreateApprovalDto,
  UpdateApprovalDto,
} from '@sopwise/modules/approvals/dto/approvals.dto';
import { JwtAuthGuard } from '@sopwise/modules/auth/guard/jwt.guard';
import { GetCurrentUser } from '@sopwise/modules/user/decorator/current-user.decorator';
import { Roles } from '@sopwise/roles/roles.decorator';
import { RolesGuard } from '@sopwise/roles/roles.guard';

@ApiTags('Approvals')
@Controller('approvals')
export class ApprovalsController {
  constructor(private approvals: ApprovalsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create approval' })
  @Post('')
  createApproval(
    @Body() data: CreateApprovalDto,
    @GetCurrentUser() user: SopWiseUser,
  ) {
    return this.approvals.createApproval({ ...data, authorId: user?.id });
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all approvals with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of approvals',
  })
  getAllUsers(
    @Query(new ValidationPipe({ transform: true }))
    query: PaginationQueryDto,
  ) {
    return this.approvals.listApprovals(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update approval' })
  @Roles(Role.ADMIN)
  @Patch(':id')
  updateApproval(
    @Param('id') id: string,
    @Body() data: UpdateApprovalDto,
    @GetCurrentUser() user: SopWiseUser,
  ) {
    return this.approvals.updateApproval(id, { ...data, authorId: user?.id });
  }
}
