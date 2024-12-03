import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Req,
} from '@nestjs/common';
import { SopUploadService } from './sop-upload.service';

@Controller('sop')
export class SopUploadController {
  constructor(private readonly sopUploadService: SopUploadService) {}

  //Please add access key to the aws user used in .env file
  @Post('upload')
  async uploadFile(@Req() req) {
    const file = await req.file();

    if (!file) {
      throw new BadRequestException('File is required.');
    }

    const { filename, mimetype } = file;

    try {
      const fileBuffer = await file.toBuffer();

      // Upload to S3 using the SopUploadService
      const result = await this.sopUploadService.uploadToS3(
        filename,
        fileBuffer,
        mimetype,
      );

      return {
        message: 'File uploaded successfully',
        url: result.url,
      };
    } catch (error) {
      console.error('File upload failed:', error);
      throw new BadRequestException('Failed to upload file to S3');
    }
  }

  @Get('test-connection')
  async testConnection() {
    await this.sopUploadService.testConnection();
    return { message: 'S3 connection is successful!' };
  }
}
