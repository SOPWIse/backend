import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { R2ClientFactory } from '@sopwise/modules/file-manager/r2/r2.factory';
import { Readable } from 'node:stream';

interface R2ObjectAccessArgs {
  objectKey: string;
  bucket: string;
}

interface R2UploadArgs extends R2ObjectAccessArgs {
  file: Buffer;
  mimeType?: string;
  isPublic?: boolean;
}

@Injectable()
export class R2Service {
  constructor(
    private readonly r2Factory: R2ClientFactory,
    private readonly configService: ConfigService,
  ) {}

  BUCKET_NAME = this.configService.get<string>('ACCESS_KEY_ID');
  ACCOUNT_ID = this.configService.get<string>('ACCOUNT_ID');

  async upload({
    file,
    objectKey,
    mimeType,
    bucket = this.BUCKET_NAME,
    isPublic = true,
  }: R2UploadArgs): Promise<string> {
    try {
      const commandInput: PutObjectCommandInput = {
        Key: objectKey,
        Bucket: bucket,
        Body: file,
        ContentType: mimeType,
        ContentDisposition: 'inline',
      };

      // if (isPublic) commandInput.ACL = 'public-read'
      const command = new PutObjectCommand(commandInput);
      const send = await this.r2Factory.client.send(command);
      return `https://${this.ACCOUNT_ID}.r2.cloudflarestorage.com/${this.BUCKET_NAME}/${objectKey}`;
    } catch (error) {
      console.log(error);
      throw new Error('An error occurred uploading file to storage');
    }
  }

  async replace({ file, objectKey, mimeType, bucket, isPublic = true }: R2UploadArgs): Promise<void> {
    await this.deleteObject({ objectKey, bucket });
    await this.upload({ file, objectKey, mimeType, bucket, isPublic });
  }

  async deleteObject({ objectKey, bucket }: R2ObjectAccessArgs) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: objectKey,
      });
      await this.r2Factory.client.send(command);
    } catch (error) {
      throw new Error('An error occurred deleting the file from storage');
    }
  }

  async getObject({ objectKey, bucket }: R2ObjectAccessArgs) {
    const command = new GetObjectCommand({ Bucket: bucket, Key: objectKey });
    try {
      const object = await this.r2Factory.client.send(command);
      return {
        contentType: object.ContentType,
        contentStream: object.Body as Readable,
      };
    } catch (error) {
      if (error.name === 'NoSuchKey') throw new Error('The file does not exist in storage');
      throw new Error('An error occurred downloading the file from storage');
    }
  }
}
