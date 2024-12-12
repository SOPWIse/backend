import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Service } from '@sopwise/modules/file-manager/aws/s3/s3.service';
import { FileDetailsResponseDTO } from '@sopwise/modules/file-manager/dto/file-upload-response.dto';
import {
  CreateFileDTO,
  ICreateFile,
} from '@sopwise/modules/file-manager/dto/file-upload-s3.dto';
import { R2Service } from '@sopwise/modules/file-manager/r2/r2.service';
import { IFileBody } from '@sopwise/modules/file-manager/types';

@Injectable()
export class FileManagerService {
  constructor(
    private readonly r2Service: R2Service,
    private readonly s3Service: S3Service,
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

  private getObjectKey(fileName: string) {
    const date = new Date();
    return `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}/${Date.now().toString()}/${fileName}`;
  }

  async uploadFileAws(
    data: CreateFileDTO,
    file: IFileBody,
  ): Promise<FileDetailsResponseDTO> {
    console.error('data', data);
    // const { name } = path.parse(file.originalName);
    // const { ext } = path.parse(file.originalName);

    // const objectKey = this.getObjectKey(
    //   `${name.replace(/[^A-Z0-9]+/gi, '_')}${ext}`,
    // );

    const objectKey = data.title + new Date().getTime();
    const publicBucketName = this.config?.get<string>('BUCKET_NAME');

    const url = await this.s3Service.upload({
      bucket: publicBucketName,
      objectKey,
      file: file.buffer,
      mimeType: file.mimeType,
    });

    const createFile: ICreateFile = {
      ...data,
      file: url,
    };

    return {
      id: objectKey,
      file: url,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      title: data.title,
      visibility: data.visibility,
      ...createFile,
    };
  }
}
