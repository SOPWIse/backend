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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role, SopWiseUser } from '@prisma/client';
import { PaginationQueryDto } from '@sopwise/common/pagination/pagination.dto';
import { JwtAuthGuard } from '@sopwise/modules/auth/guard/jwt.guard';
import { CreateSopDto } from '@sopwise/modules/sop/dto/sop.dto';
import { SopService } from '@sopwise/modules/sop/sop.service';
import { GetCurrentUser } from '@sopwise/modules/user/decorator/current-user.decorator';
import { Roles } from '@sopwise/roles/roles.decorator';
import { RolesGuard } from '@sopwise/roles/roles.guard';

@ApiTags('SOPs')
@ApiBearerAuth() // Adds JWT Bearer token authorization header in Swagger UI
@Controller('sop')
export class SopController {
  constructor(private readonly sopService: SopService) {}

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.AUTHOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all SOPs',
    description:
      'Retrieves a paginated list of all SOPs. Only accessible to ADMIN and AUTHOR roles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the list of SOPs.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAllSops(
    @Query(new ValidationPipe({ transform: true }))
    query: PaginationQueryDto,
  ) {
    return await this.sopService.listSop(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.AUTHOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get SOP by ID',
    description:
      'Retrieves a specific SOP by its ID. Only accessible to ADMIN and AUTHOR roles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the SOP details with its content.',
  })
  @ApiResponse({ status: 404, description: 'SOP not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSopById(@Param('id') id: string) {
    return await this.sopService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.AUTHOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update SOP by ID',
    description:
      'Updates the details of a specific SOP by its ID. Only accessible to ADMIN and AUTHOR roles.',
  })
  @ApiResponse({
    status: 200,
    description: 'SOP updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'SOP not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateSop(
    @GetCurrentUser() user: SopWiseUser,
    @Param('id') id: string,
    @Body() body: Partial<CreateSopDto>,
  ) {
    return await this.sopService.updateSop(id, { authorId: user.id, ...body });
  }

  @Post('/')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.AUTHOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new SOP',
    description:
      'Creates a new SOP with the provided data. Only accessible to ADMIN and AUTHOR roles.',
  })
  @ApiResponse({
    status: 201,
    description: 'SOP created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createSop(
    @GetCurrentUser() user: SopWiseUser,
    @Body() body: CreateSopDto,
  ) {
    return await this.sopService.createSop({ authorId: user.id, ...body });
  }
}