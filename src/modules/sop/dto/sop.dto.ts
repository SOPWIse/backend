import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

enum SopStatusEnum {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  LISTED = 'LISTED',
}

export class CreateSopDto {
  @ApiPropertyOptional({
    description: 'Unique identifier for the SOP',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid UUID' })
  id?: string;

  @ApiProperty({
    description: 'Title of the SOP',
    minLength: 1,
    maxLength: 255,
    example: 'SOP Title',
  })
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title!: string;

  @ApiProperty({
    description: 'Description of the SOP',
    minLength: 1,
    maxLength: 1000,
    example: 'This is an SOP description.',
  })
  @IsString()
  @MinLength(1, { message: 'Description is required' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description!: string;

  @ApiPropertyOptional({
    enum: SopStatusEnum,
    description: 'Current status of the SOP',
    example: 'DRAFT',
  })
  @IsEnum(SopStatusEnum, { message: 'Invalid status' })
  @IsOptional()
  status?: SopStatusEnum;

  @ApiPropertyOptional({
    description: 'Category of the SOP',
    maxLength: 100,
    example: 'Operations',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Category must not exceed 100 characters' })
  category?: string;

  @ApiProperty({
    description: 'Indicates if the SOP is listed',
    default: false,
  })
  @IsBoolean()
  isListed: boolean = false;

  @ApiProperty({
    description: 'Indicates if the SOP is deleted',
    default: false,
  })
  @IsBoolean()
  isDeleted: boolean = false;

  @ApiPropertyOptional({
    description: 'Date when the SOP was published',
    type: String,
    format: 'date-time',
    example: '2024-12-01T12:00:00Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  publishedAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Additional meta data for the SOP',
    example: { key: 'value' },
  })
  @IsOptional()
  @IsObject({ message: 'Meta data should be an object' })
  metaData?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Content of the SOP',
    minLength: 1,
    maxLength: 1000000,
    example: 'SOP detailed content here.',
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Content is required' })
  @MaxLength(1000000, { message: 'Content is too long' })
  content?: string;

  @ApiProperty({
    description: 'Date when the SOP was created',
    type: String,
    format: 'date-time',
    example: '2024-12-01T12:00:00Z',
  })
  @IsDate()
  @Type(() => Date)
  createdAt: Date = new Date();

  @ApiProperty({
    description: 'Date when the SOP was last updated',
    type: String,
    format: 'date-time',
    example: '2024-12-01T12:00:00Z',
  })
  @IsDate()
  @Type(() => Date)
  updatedAt: Date = new Date();

  @ApiPropertyOptional({
    description: 'URL for the SOP content',
    format: 'url',
    maxLength: 500,
    example: 'https://example.com/sop.pdf',
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Invalid URL' })
  @MaxLength(500, { message: 'Content URL must not exceed 500 characters' })
  contentUrl?: string;
}
