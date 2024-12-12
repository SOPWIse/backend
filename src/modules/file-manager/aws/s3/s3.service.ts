import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { S3ClientFactory } from '@sopwise/modules/file-manager/aws/s3/s3.factory';
import { Readable } from 'node:stream';

interface S3ObjectAccessArgs {
  objectKey: string;
  bucket: string;
}

interface S3UploadArgs extends S3ObjectAccessArgs {
  file: Buffer;
  mimeType?: string;
  isPublic?: boolean;
}

@Injectable()
export class S3Service {
  constructor(private readonly s3Factory: S3ClientFactory) {}

  async upload({
    file,
    objectKey,
    mimeType,
    bucket,
    isPublic = true,
  }: S3UploadArgs): Promise<string> {
    try {
      const commandInput: PutObjectCommandInput = {
        Key: objectKey,
        Bucket: bucket,
        Body: file,
        ContentType: mimeType,
        ContentDisposition: 'inline',
      };

      if (isPublic) commandInput.ACL = 'public-read';
      const command = new PutObjectCommand(commandInput);

      await this.s3Factory.client.send(command);
      const encodeFileName = encodeURIComponent(objectKey);
      console.log(`https://${bucket}.s3.amazonaws.com/${encodeFileName}`);
      return `https://${bucket}.s3.amazonaws.com/${encodeFileName}`;
    } catch (error) {
      console.log(error);
      throw new Error('An error occurred uploading file to storage');
    }
  }

  async replace({
    file,
    objectKey,
    mimeType,
    bucket,
    isPublic = true,
  }: S3UploadArgs): Promise<void> {
    await this.deleteObject({ objectKey, bucket });
    await this.upload({ file, objectKey, mimeType, bucket, isPublic });
  }

  async deleteObject({ objectKey, bucket }: S3ObjectAccessArgs) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: objectKey,
      });
      await this.s3Factory.client.send(command);
    } catch (error) {
      throw new Error('An error occurred deleting the file from storage');
    }
  }

  async getObject({ objectKey, bucket }: S3ObjectAccessArgs) {
    const command = new GetObjectCommand({ Bucket: bucket, Key: objectKey });
    try {
      const object = await this.s3Factory.client.send(command);
      return {
        contentType: object.ContentType,
        contentStream: object.Body as Readable,
      };
    } catch (error) {
      if (error.name === 'NoSuchKey')
        throw new Error('The file does not exist in storage');
      throw new Error('An error occurred downloading the file from storage');
    }
  }
}
