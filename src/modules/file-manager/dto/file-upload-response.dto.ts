import { ApiResponseProperty } from '@nestjs/swagger';
import { BaseDTO } from '@sopwise/common/models/base-model';
import { IFiles } from '@sopwise/modules/file-manager/dto/file-upload-s3.dto';
import { IsOptional } from 'class-validator';

export class FileDetailsResponseDTO extends BaseDTO implements IFiles {
  @ApiResponseProperty({ type: () => String, example: 'Title of File' })
  title: string;

  @ApiResponseProperty({
    type: () => String,
    example: 'c4690e50-1717-11ee-add0-8104fcf3a0d3',
  })
  id: string;

  @ApiResponseProperty({
    type: () => String,
    example: 'c4690e50-1717-11ee-add0-8104fcf3a0d3',
  })
  @IsOptional()
  userId: string;

  @ApiResponseProperty({
    type: () => String,
    example: 'SOP',
  })
  @IsOptional()
  category: string;

  @ApiResponseProperty({ type: () => String, example: 'private' })
  visibility: string;

  @ApiResponseProperty({
    type: () => Object,
    example: {
      id: 'c4690e50-1717-11ee-add0-8104fcf3a0d3',
    },
  })
  file: any;

  @ApiResponseProperty({
    type: () => Date,
    example: '2022-08-01T14:09:36.071+00:00',
  })
  readonly createdAt: Date;

  @ApiResponseProperty({
    type: () => Date,
    example: '2022-08-01T14:09:36.071+00:00',
  })
  readonly updatedAt: Date;
}
