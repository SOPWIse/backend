import {
  Body,
  Controller,
  Delete,
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
import { PaginationQueryDto } from '@sopwise/common/pagination/pagination.dto';
import { JwtAuthGuard } from '@sopwise/modules/auth/guard/jwt.guard';
import { ExperimentLogDto, StepDto } from './dto/experiment-logs.dto';
import { ExperimentLogsService } from './experiment-logs.service';

import { Role } from '@prisma/client';
import { Roles } from '@sopwise/roles/roles.decorator';
import { RolesGuard } from '@sopwise/roles/roles.guard';

@ApiTags('Experiment Logs')
@Controller('experiment-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VP, Role.ADMIN)
export class ExperimentLogsController {
  constructor(private readonly experimentLogsService: ExperimentLogsService) {}

  @Post('/')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiOperation({ summary: 'Create a new experiment log' })
  @ApiResponse({
    status: 201,
    description: 'The experiment log has been successfully created.',
  })
  async createLog(@Body() body: ExperimentLogDto) {
    return await this.experimentLogsService.createLog(body);
  }

  @Get('/all')
  @ApiOperation({ summary: 'Create a new experiment log' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 201,
    description: 'The experiment log has been successfully created.',
  })
  async getLogs(
    @Query(new ValidationPipe({ transform: true }))
    query: PaginationQueryDto,
  ) {
    return await this.experimentLogsService.getAllLogs(query);
  }

  @Post('step')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new step for an experiment log' })
  @ApiResponse({
    status: 201,
    description: 'The step has been successfully created.',
  })
  async createStep(@Body() step: StepDto) {
    return await this.experimentLogsService.createStepOnLogId(step);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an experiment log' })
  @ApiResponse({
    status: 200,
    description: 'The experiment log has been successfully updated.',
  })
  async updateLog(@Param('id') id: string, @Body() body: Partial<ExperimentLogDto>) {
    return await this.experimentLogsService.updateLogs(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an experiment log' })
  @ApiResponse({
    status: 200,
    description: 'The experiment log has been successfully deleted.',
  })
  async deleteLog(@Param('id') id: string) {
    return await this.experimentLogsService.deleteLog(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get an experiment log by its ID' })
  @ApiResponse({
    status: 200,
    description: 'The experiment log was found.',
  })
  async getLogById(@Param('id') id: string) {
    return await this.experimentLogsService.getLogById(id);
  }

  @Get('sop/:sopId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get experiment logs by SOP ID' })
  @ApiResponse({
    status: 200,
    description: 'Experiment logs for the given SOP ID.',
  })
  async getLogsBySopId(@Param('sopId') sopId: string) {
    return await this.experimentLogsService.getLogsBySopId(sopId);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get experiment logs by User ID' })
  @ApiResponse({
    status: 200,
    description: 'Experiment logs for the given User ID.',
  })
  async getLogsByUserId(@Param('userId') userId: string) {
    return await this.experimentLogsService.getLogByUserId(userId);
  }

  @Get('/:logId/steps')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get steps for a specific experiment log' })
  @ApiResponse({
    status: 200,
    description: 'Steps for the specified experiment log.',
  })
  async getStepsByLogId(@Param('logId') logId: string) {
    return await this.experimentLogsService.getStepsByLogId(logId);
  }

  @Get('step/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a specific step by its ID' })
  @ApiResponse({
    status: 200,
    description: 'The step was found.',
  })
  async getStepById(@Param('id') id: string) {
    return await this.experimentLogsService.getStepById(id);
  }

  @Post('generate-pdf/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get audit report pdf url' })
  @ApiResponse({
    status: 200,
  })
  async getPDFReport(@Param('id') id: string) {
    return await this.experimentLogsService.getPDFReport(id);
  }
}
