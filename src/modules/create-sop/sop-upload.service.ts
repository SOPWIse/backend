import {
  HeadBucketCommand,
  ListBucketsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SopUploadService {
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  async testConnection(): Promise<void> {
    try {
      const buckets = await this.s3Client.send(new ListBucketsCommand({}));
      console.log('S3 Buckets:', buckets.Buckets);

      const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      console.log(`Bucket "${bucketName}" is accessible.`);
    } catch (error) {
      console.error('Error testing S3 connection:', error);
      throw new InternalServerErrorException(
        'Failed to connect to S3. Please check your credentials and permissions.',
      );
    }
  }

  async uploadToS3(
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<{ url: string }> {
    const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    const fileKey = `uploads/${Date.now()}-${fileName}`;

    const params = {
      Bucket: bucketName,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: mimeType,
    };

    try {
      console.log('Uploading file to S3 with params:', params);
      await this.s3Client.send(new PutObjectCommand(params));
      console.log('File uploaded successfully.');

      return {
        url: `https://${bucketName}.s3.${this.configService.get<string>(
          'AWS_REGION',
        )}.amazonaws.com/${fileKey}`,
      };
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }
}
