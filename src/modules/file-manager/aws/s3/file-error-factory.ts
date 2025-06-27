import { BadRequestException } from '@nestjs/common/exceptions';
import { ParseFilePipe, ParseFilePipeBuilder } from '@nestjs/common/pipes';
import { ASSET_MAX_SIZE_IN_MB, MIME_TYPES_MAP } from '@sopwise/modules/file-manager/constants';

import { FILE_FORMAT_ENUM } from '@sopwise/modules/file-manager/types';

export function FileUploadErrorFactory() {
  const sizeError = 'File size should not be above 10mb';
  const fileTypeError = `File type should be one of ${enumString(FILE_FORMAT_ENUM)}`;
  return [
    new ParseFilePipe({
      fileIsRequired: true,
    }),
    new ParseFilePipeBuilder()
      .addFileTypeValidator({
        fileType: new RegExp(`(${Object.keys(MIME_TYPES_MAP).join('|')})$`),
      })
      .addMaxSizeValidator({ maxSize: ASSET_MAX_SIZE_IN_MB })
      .build({
        exceptionFactory(error) {
          const message = error.includes('size') ? sizeError : fileTypeError;
          return new BadRequestException(message);
        },
      }),
  ];
}

export function enumString(enumObject: Record<string, string>): string {
  return Object.values(enumObject).join('|');
}
