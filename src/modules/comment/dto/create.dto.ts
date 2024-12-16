import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'The content of the comment.',
    example: 'This is a comment.',
  })
  @IsString()
  @IsNotEmpty()
  comment!: string;

  @ApiPropertyOptional({
    description: 'The status of the comment, either RESOLVED or UNRESOLVED.',
    enum: ['RESOLVED', 'UNRESOLVED'],
    default: 'UNRESOLVED',
    example: 'UNRESOLVED',
  })
  @IsEnum(['RESOLVED', 'UNRESOLVED'])
  @IsOptional()
  status: 'RESOLVED' | 'UNRESOLVED' = 'UNRESOLVED';

  @ApiProperty({
    description: 'The ID of the content (SOP) the comment belongs to.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  contentId!: string;

  @ApiPropertyOptional({
    description: 'Flag to indicate if the comment is deleted.',
    default: false,
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isDeleted: boolean = false;

  @ApiPropertyOptional({
    description: 'The ID of the parent comment, if it is a reply.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({
    description:
      'The timestamp when the comment was created. Managed by the database.',
    example: '2024-12-16T08:00:00.000Z',
  })
  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @ApiPropertyOptional({
    description:
      'The timestamp when the comment was last updated. Managed by the database.',
    example: '2024-12-16T09:00:00.000Z',
  })
  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}
