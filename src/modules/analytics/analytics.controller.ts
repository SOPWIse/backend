import { Body, Controller, Post, UseFilters, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { HttpExceptionFilter } from '@sopwise/common/exceptions/exception-filter';
import { RunAnalyticsDoc } from '@sopwise/modules/analytics/analytics.doc';
import { AnalyticsService } from '@sopwise/modules/analytics/analytics.service';
import { MultiModelAnalyticsDto, SopwiseAnalyticsFilterDto } from '@sopwise/modules/analytics/dto/analytics.dto';
import { JwtAuthGuard } from '@sopwise/modules/auth/guard/jwt.guard';
import { Roles } from '@sopwise/roles/roles.decorator';
import { RolesGuard } from '@sopwise/roles/roles.guard';
import { MultiModelAnalyticsSchema } from '@sopwise/types/analytics.types';

@ApiTags('Analytics')
@Controller('analytics')
@UseFilters(HttpExceptionFilter)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.VP)
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Post('/')
  @RunAnalyticsDoc()
  async runAnalytics(@Body() dto: MultiModelAnalyticsDto) {
    if (!dto.models || dto.models.length === 0) {
      throw new Error('No models provided for analytics');
    }
    return await this.analytics.runAnalytics(MultiModelAnalyticsSchema.parse(dto));
  }

  @Post('/user/top-five-active')
  async getTopFiveActiveUsers(@Body() dto: SopwiseAnalyticsFilterDto) {
    return await this.analytics.topActiveUsers(dto);
  }
}
