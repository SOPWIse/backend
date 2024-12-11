import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { R2Service } from '@sopwise/modules/file-manager/r2/r2.service';

@Injectable()
export class FileManagerService {
  constructor(
    private readonly r2Service: R2Service,
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
}
