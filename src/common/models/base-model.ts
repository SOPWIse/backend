import { ApiResponseProperty } from '@nestjs/swagger';
import { NoEmptyBodyRule } from '@sopwise/common/models/no-empty-body-validator';
import { IBaseModel } from '@sopwise/modules/file-manager/dto/file-upload-s3.dto';
import { Allow, Validate } from 'class-validator';

export class BaseUpdateDTO {
  @Validate(NoEmptyBodyRule)
  @Allow()
  protected checkEmpty?: never;
}

export class BaseDTO implements IBaseModel {
  @ApiResponseProperty({
    type: () => String,
    example: '507f191e810c19729de860ea',
  })
  readonly id: string;

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
