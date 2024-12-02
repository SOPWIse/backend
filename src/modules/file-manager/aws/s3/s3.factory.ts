import { S3, S3ClientConfig } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type IGetSignedUrl = { getSignedUrl: typeof getSignedUrl };
@Injectable()
export class S3ClientFactory {
  constructor(private configService: ConfigService) {}
  get client(): S3 {
    // const accessKeyId = 'AKIAY5KMC4GMU7F5D5GH'
    const accessKeyId = this.configService.get<string>('aws.accessKeyId');
    const secretAccessKey = this.configService?.get<string>(
      'aws.secretAccessKey',
    );
    const region = this.configService?.get<string>('aws.region');

    const options: S3ClientConfig = {
      region: region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };
    return new S3(options);
  }

  get urls(): IGetSignedUrl {
    return { getSignedUrl };
  }
}
