import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@webundsoehne/nest-fastify-file-upload/dist/interceptors';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload/dist/interfaces';

import { Role, SopWiseUser } from '@prisma/client';
import { PaginationQueryDto } from '@sopwise/common/pagination/pagination.dto';
import { JwtAuthGuard } from '@sopwise/modules/auth/guard/jwt.guard';
import { FileUploadErrorFactory } from '@sopwise/modules/file-manager/aws/s3/file-error-factory';
import { FileDetailsResponseDTO } from '@sopwise/modules/file-manager/dto/file-upload-response.dto';
import {
  CreateFileDTO,
  UpdateFileDTO,
} from '@sopwise/modules/file-manager/dto/file-upload-s3.dto';
import { FileManagerService } from '@sopwise/modules/file-manager/file-manager.service';
import { GetCurrentUser } from '@sopwise/modules/user/decorator/current-user.decorator';
import { Roles } from '@sopwise/roles/roles.decorator';
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
    @GetCurrentUser() user: SopWiseUser,
    @Body() data: CreateFileDTO,
    @UploadedFile(...FileUploadErrorFactory()) file: MulterFile,
  ): Promise<FileDetailsResponseDTO> {
    return this.fileSettingService.uploadFileAws(data, user.id, {
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
    });
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.AUTHOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all SOPs',
    description:
      'Retrieves a paginated list of all SOPs. Only accessible to ADMIN and AUTHOR roles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the list of SOPs.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAllFiles(
    @Query(new ValidationPipe({ transform: true }))
    query: PaginationQueryDto,
  ) {
    return await this.fileSettingService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a file by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the file with the given ID.',
  })
  async findOne(@Param('id') id: string) {
    return this.fileSettingService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a file by ID' })
  @ApiResponse({
    status: 200,
    description: 'The file has been successfully updated.',
  })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateFileDto: UpdateFileDTO,
  ) {
    return this.fileSettingService.update(id, updateFileDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file by ID' })
  @ApiResponse({
    status: 200,
    description: 'The file has been successfully deleted.',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.fileSettingService.remove(id);
  }
}
