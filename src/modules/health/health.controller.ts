import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheck } from '@nestjs/terminus';
import { HealthService } from '@sopwise/modules/health/health.service';
import { HealthCheckResponse } from '@sopwise/modules/health/health.types';

@ApiTags('Health Check')
@Controller('')
export class HealthController {
  constructor(private healthCheck: HealthService) {}

  @ApiOperation({ summary: 'Health Check' })
  @ApiOkResponse({
    description: 'Health Check run correctly.',
  })
  @Get('health')
  @HealthCheck()
  check(): Promise<HealthCheckResponse> {
    return this.healthCheck.check();
  }
}
