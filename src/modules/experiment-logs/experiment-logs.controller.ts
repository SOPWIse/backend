import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExperimentLogDto, StepDto } from './dto/experiment-logs.dto';
import { ExperimentLogsService } from './experiment-logs.service';

@ApiTags('Experiment Logs')
@Controller('experiment-logs')
export class ExperimentLogsController {
  constructor(private readonly experimentLogsService: ExperimentLogsService) {}

  @Post('/')
  @ApiOperation({ summary: 'Create a new experiment log' })
  @ApiResponse({
    status: 201,
    description: 'The experiment log has been successfully created.',
  })
  async createLog(@Body() body: ExperimentLogDto) {
    return await this.experimentLogsService.createLog(body);
  }

  @Post('step')
  @ApiOperation({ summary: 'Create a new step for an experiment log' })
  @ApiResponse({
    status: 201,
    description: 'The step has been successfully created.',
  })
  async createStep(@Body() step: StepDto) {
    return await this.experimentLogsService.createStepOnLogId(step);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an experiment log' })
  @ApiResponse({
    status: 200,
    description: 'The experiment log has been successfully updated.',
  })
  async updateLog(@Param('id') id: string, @Body() body: Partial<ExperimentLogDto>) {
    return await this.experimentLogsService.updateLogs(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an experiment log' })
  @ApiResponse({
    status: 200,
    description: 'The experiment log has been successfully deleted.',
  })
  async deleteLog(@Param('id') id: string) {
    return await this.experimentLogsService.deleteLog(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an experiment log by its ID' })
  @ApiResponse({
    status: 200,
    description: 'The experiment log was found.',
  })
  async getLogById(@Param('id') id: string) {
    return await this.experimentLogsService.getLogById(id);
  }

  @Get('sop/:sopId')
  @ApiOperation({ summary: 'Get experiment logs by SOP ID' })
  @ApiResponse({
    status: 200,
    description: 'Experiment logs for the given SOP ID.',
  })
  async getLogsBySopId(@Param('sopId') sopId: string) {
    return await this.experimentLogsService.getLogsBySopId(sopId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get experiment logs by User ID' })
  @ApiResponse({
    status: 200,
    description: 'Experiment logs for the given User ID.',
  })
  async getLogsByUserId(@Param('userId') userId: string) {
    return await this.experimentLogsService.getLogByUserId(userId);
  }

  @Get('/:logId/steps')
  @ApiOperation({ summary: 'Get steps for a specific experiment log' })
  @ApiResponse({
    status: 200,
    description: 'Steps for the specified experiment log.',
  })
  async getStepsByLogId(@Param('logId') logId: string) {
    return await this.experimentLogsService.getStepsByLogId(logId);
  }

  @Get('step/:id')
  @ApiOperation({ summary: 'Get a specific step by its ID' })
  @ApiResponse({
    status: 200,
    description: 'The step was found.',
  })
  async getStepById(@Param('id') id: string) {
    return await this.experimentLogsService.getStepById(id);
  }
}
