import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'The content of the comment.',
    example: 'This is a comment.',
  })
  @IsString()
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
  @IsOptional()
  contentId?: string;

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
    description: 'The timestamp when the comment was created. Managed by the database.',
    example: '2024-12-16T08:00:00.000Z',
  })
  @IsDate()
  @IsOptional()
  createdAt?: string;

  @ApiPropertyOptional({
    description: 'The timestamp when the comment was last updated. Managed by the database.',
    example: '2024-12-16T09:00:00.000Z',
  })
  @IsDate()
  @IsOptional()
  updatedAt?: string;

  @ApiPropertyOptional({
    description: 'The selected text that the comment refers to.',
    example: 'This is the selected text.',
  })
  @IsString()
  @IsOptional()
  selectedText?: string;

  @ApiPropertyOptional({
    description: 'Author of the comment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsOptional()
  authorId?: string;

  @ApiPropertyOptional({
    description: 'The selected HTML string of the comment.',
    example: '<p>This is the comment.</p>',
  })
  @IsString()
  @IsOptional()
  htmlString?: string;

  @ApiPropertyOptional({
    description: 'Unique Id to find and patch the content of SOP',
    example: 'comment-[some date]',
  })
  @IsString()
  @IsOptional()
  uniqueId: string;
}
