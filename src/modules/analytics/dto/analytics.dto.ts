import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';


export enum AnalyticsOperation {
  COUNT = 'count',
  GROUP_BY = 'groupBy',
  FIND_MANY = 'findMany',
  AGGREGATE = 'aggregate',
}

export class SopwiseAnalyticsFilterDto {
  @ApiProperty({
    description: 'Filters to apply on the analytics query',
    type: Object,
    required: false,
    example: { isListed: true, isDeleted: false },
  })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @ApiProperty({
    description: 'Role to filter results by',
    type: String,
    required: false,
    example: 'ADMIN',
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({
    description: 'Search term to filter results',
    type: String,
    required: false,
    example: 'example search term',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Fields to search in',
    type: [String],
    required: false,
    example: ['title', 'description'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  searchFields?: string[];

  @ApiProperty({
    description: 'Field to apply date filters on',
    type: String,
    required: false,
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  dateField?: string;

  @ApiProperty({
    description: 'Start date for filtering results',
    type: String,
    required: false,
    example: '2023-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for filtering results',
    type: String,
    required: false,
    example: '2023-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class ModelAnalyticsRequestDto {
  @ApiProperty({
    description: 'The model name for the analytics request',
    type: String,
    example: 'Sop',
    enum: Object.keys(Prisma.ModelName),
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  model: keyof typeof Prisma.ModelName;

  @ApiProperty({
    description: 'The operation to perform on the model',
    type: String,
    enum: AnalyticsOperation,
    example: AnalyticsOperation.COUNT,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(AnalyticsOperation)
  operation: AnalyticsOperation;

  @ApiProperty({
    description: 'Additional arguments for the operation',
    type: Object,
    required: false,
    example: { includeCount: true, fields: { avg: ['total_time', 'completion_percentage'] } },
  })
  @IsOptional()
  @IsObject()
  args?: Record<string, any>;

  @ApiProperty({
    description: 'Filter criteria for the analytics request',
    type: SopwiseAnalyticsFilterDto,
    required: false,
  })
  @IsNotEmpty()
  @ValidateNested()
  @IsOptional()
  @Type(() => SopwiseAnalyticsFilterDto)
  filter?: SopwiseAnalyticsFilterDto;
}

export class MultiModelAnalyticsDto {
  @ApiProperty({
    description: 'Array of model analytics requests',
    type: [ModelAnalyticsRequestDto],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModelAnalyticsRequestDto)
  models: ModelAnalyticsRequestDto[];
}
