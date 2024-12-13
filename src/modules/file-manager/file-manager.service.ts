import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileSettings } from '@prisma/client';
import { PaginationQueryDto } from '@sopwise/common/pagination/pagination.dto';
import { PaginationService } from '@sopwise/common/pagination/pagination.service';
import { S3Service } from '@sopwise/modules/file-manager/aws/s3/s3.service';
import { FileDetailsResponseDTO } from '@sopwise/modules/file-manager/dto/file-upload-response.dto';
import {
  CreateFileDTO,
  UpdateFileDTO,
} from '@sopwise/modules/file-manager/dto/file-upload-s3.dto';
import { R2Service } from '@sopwise/modules/file-manager/r2/r2.service';
import { IFileBody } from '@sopwise/modules/file-manager/types';
import { PrismaService } from '@sopwise/prisma/prisma.service';

@Injectable()
export class FileManagerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2Service: R2Service,
    private readonly s3Service: S3Service,
    private readonly paginationService: PaginationService,
    private readonly config: ConfigService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    isPublic = true,
  ): Promise<string> {
    const { originalname, mimetype, buffer } = file;

    const bucket = this.config.get<string>('BUCKET_NAME');
    const objectKey = `uploads/${originalname}`;

    return await this.r2Service.upload({
      file: buffer,
      objectKey,
      mimeType: mimetype,
      bucket,
      isPublic,
    });
  }

  private async uploadToS3(
    file: IFileBody,
    userId: string,
  ): Promise<{ objectKey: string; url: string }> {
    const objectKey = this.generateObjectKey(userId, file.originalName);
    const bucket = this.config?.get<string>('BUCKET_NAME');

    const url = await this.s3Service.upload({
      bucket,
      objectKey,
      file: file.buffer,
      mimeType: file.mimeType,
    });

    return { objectKey, url };
  }

  async uploadFileAws(
    data: CreateFileDTO,
    id: string,
    file: IFileBody,
  ): Promise<FileDetailsResponseDTO> {
    const { objectKey, url } = await this.uploadToS3(file, id);

    const fileEntity = await this.prisma.safeCreate<
      FileSettings,
      FileDetailsResponseDTO
    >('fileSettings', {
      id: objectKey,
      userId: id,
      file: url,
      title: data.title,
      visibility: data.visibility ?? 'public',
      category: 'SOP',
      updatedAt: data.updatedAt,
      createdAt: data.createdAt,
    });

    return fileEntity;
  }

  async update(
    id: string,
    updateFileDto: UpdateFileDTO,
    file?: IFileBody,
  ): Promise<FileSettings> {
    try {
      const existingFile = await this.prisma.fileSettings.findUnique({
        where: { id },
      });

      if (!existingFile) {
        throw new NotFoundException('File not found');
      }

      let url: string;
      if (file) {
        url = (await this.uploadToS3(file, existingFile.userId)).url;
      }

      return await this.prisma.fileSettings.update({
        where: { id },
        data: {
          ...updateFileDto,
          file: url ?? existingFile.file,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('FileManagerService.update Error:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update file');
    }
  }

  async findAll(query: PaginationQueryDto) {
    return this.paginationService.paginate<FileSettings>(
      'FileSettings',
      query,
      {
        id: true,
        userId: true,
        file: true,
        title: true,
        visibility: true,
        category: true,
        createdAt: true,
        updatedAt: true,
      },
    );
  }
  async findOne(id: string) {
    return this.prisma.fileSettings.findUnique({ where: { id } });
  }

  // async update(id: string, updateFileDto: UpdateFileDTO) {}

  async remove(id: string): Promise<void> {
    await this.prisma.fileSettings.delete({ where: { id } });
  }

  private generateObjectKey(userId: string, fileName: string): string {
    const timestamp = Date.now();
    return `user_${userId}/files/${fileName}/${timestamp}`;
  }
}
