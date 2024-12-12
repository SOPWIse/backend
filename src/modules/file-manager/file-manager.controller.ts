import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@webundsoehne/nest-fastify-file-upload/dist/interceptors';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload/dist/interfaces';

import { JwtAuthGuard } from '@sopwise/modules/auth/guard/jwt.guard';
import { FileUploadErrorFactory } from '@sopwise/modules/file-manager/aws/s3/file-error-factory';
import { FileDetailsResponseDTO } from '@sopwise/modules/file-manager/dto/file-upload-response.dto';
import { CreateFileDTO } from '@sopwise/modules/file-manager/dto/file-upload-s3.dto';
import { FileManagerService } from '@sopwise/modules/file-manager/file-manager.service';
import { RolesGuard } from '@sopwise/roles/roles.guard';

@ApiTags('File Settings API')
@Controller('files')
export class FileManagerController {
  constructor(private fileSettingService: FileManagerService) {}

  @ApiOperation({ summary: '' })
  @ApiOkResponse({
    description: '',
    type: '',
  })
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async uploadFile(
    @Body() data: CreateFileDTO,
    @UploadedFile(...FileUploadErrorFactory()) file: MulterFile,
  ): Promise<FileDetailsResponseDTO> {
    return this.fileSettingService.uploadFileAws(data, {
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
    });
  }
}
