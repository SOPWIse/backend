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
  @IsOptional()
  @IsUUID('4', { message: 'Invalid UUID' })
  id?: string;

  @IsString()
  @MinLength(1, { message: 'Title is required' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title!: string;

  @IsString()
  @MinLength(1, { message: 'Description is required' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description!: string;

  @IsEnum(SopStatusEnum, { message: 'Invalid status' })
  @IsOptional()
  status?: SopStatusEnum;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Category must not exceed 100 characters' })
  category?: string;

  @IsBoolean()
  isListed: boolean = false;

  @IsBoolean()
  isDeleted: boolean = false;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  publishedAt?: Date | null;

  @IsOptional()
  @IsObject({ message: 'Meta data should be an object' })
  metaData?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Content is required' })
  @MaxLength(1000000, { message: 'Content is too long' })
  content?: string;

  @IsDate()
  @Type(() => Date)
  createdAt: Date = new Date();

  @IsDate()
  @Type(() => Date)
  updatedAt: Date = new Date();

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Invalid URL' })
  @MaxLength(500, { message: 'Content URL must not exceed 500 characters' })
  contentUrl?: string;
}
