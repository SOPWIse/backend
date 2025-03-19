import { Optional } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsNumber, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

export class StepDto {
  @ApiProperty({ description: 'Unique identifier for the step', format: 'uuid' })
  @IsUUID()
  @IsOptional()
  id: string;

  @ApiProperty({ description: 'Associated experiment log id', format: 'uuid' })
  @IsUUID()
  logId: string;

  @ApiProperty({ description: 'Time taken for this step in seconds', example: 120 })
  @IsNumber()
  time_taken: number;

  @ApiProperty({ description: 'Title for the step' })
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty({ description: 'Subtitle for the step' })
  @IsString()
  @IsOptional()
  subtitle: string;

  @ApiProperty({ description: 'Tenant identifier', default: 'sopwise' })
  @IsString()
  tenant: string;

  @ApiProperty({ description: 'Creation date of the step', type: String, format: 'date-time' })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({ description: 'Last update date of the step', type: String, format: 'date-time' })
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Form data as JSON object' })
  @IsOptional()
  @IsObject()
  form_data?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Additional meta data as JSON object' })
  @IsOptional()
  @IsObject()
  meta_data?: Record<string, any>;
}

export class ExperimentLogDto {
  @ApiProperty({ description: 'Unique identifier for the experiment log', format: 'uuid' })
  @IsUUID()
  @IsOptional()
  id: string;

  @ApiProperty({ description: 'SOP identifier' })
  @IsString()
  sopId: string;

  @ApiProperty({ description: 'User identifier' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Status of the experiment log', default: 'PENDING' })
  @IsString()
  @IsOptional()
  status: string = 'PENDING';

  @ApiProperty({ description: 'Creation date of the experiment log', type: String, format: 'date-time' })
  @IsDate()
  @Type(() => Date)
  @Optional()
  createdAt: Date;

  @ApiProperty({ description: 'Last update date of the experiment log', type: String, format: 'date-time' })
  @IsDate()
  @Type(() => Date)
  @Optional()
  updatedAt: Date;

  @ApiProperty({ description: 'Tenant identifier', default: 'sopwise' })
  @IsString()
  @IsOptional()
  tenant: string = 'sopwise';

  @ApiPropertyOptional({ description: 'Total time taken for the experiment log', example: 3600 })
  @IsOptional()
  @IsNumber()
  total_time?: number;

  @ApiPropertyOptional({ description: 'Meta data as a JSON object' })
  @IsOptional()
  @IsObject()
  meta_data?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Completion percentage of the experiment log', example: 50 })
  @IsOptional()
  @IsNumber()
  completion_percentage?: number;

  @ApiProperty({ description: 'List of steps', type: [StepDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  @IsOptional()
  steps: StepDto[];
}
