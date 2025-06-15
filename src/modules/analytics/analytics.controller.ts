import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RunAnalyticsDoc } from '@sopwise/modules/analytics/analytics.doc';
import { AnalyticsService } from '@sopwise/modules/analytics/analytics.service';
import { MultiModelAnalyticsDto, SopwiseAnalyticsFilterDto } from '@sopwise/modules/analytics/dto/analytics.dto';


@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {

	constructor(
		private readonly analytics: AnalyticsService
	) {}

	
	@Post('/')
	@RunAnalyticsDoc()
	async runAnalytics(@Body() dto: MultiModelAnalyticsDto) {
		
		if (!dto.models || dto.models.length === 0) {
			throw new Error('No models provided for analytics');
		}
		
		return await this.analytics.runAnalytics(dto);
	}

	@Post('/user/top-five-active')
	async getTopFiveActiveUsers(@Body() dto: SopwiseAnalyticsFilterDto) {
		return await this.analytics.topActiveUsers(dto);
	}

}
