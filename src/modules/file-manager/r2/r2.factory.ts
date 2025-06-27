import { S3, S3ClientConfig } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type IGetSignedUrl = { getSignedUrl: typeof getSignedUrl };
@Injectable()
export class R2ClientFactory {
  constructor(private configService: ConfigService) {}
  get client(): S3 {
    // const accessKeyId = 'AKIAY5KMC4GMU7F5D5GH'
    const accessKeyId = this.configService.get<string>('ACCESS_KEY_ID');
    const accountId = this.configService.get<string>('ACCOUNT_ID');
    const secretAccessKey = this.configService?.get<string>('SECRET_ACCESS_KEY');
    const endpoint = this.configService?.get<string>('R2_URL');

    console.log({ accessKeyId, accountId, secretAccessKey });

    const options: S3ClientConfig = {
      region: 'auto',
      endpoint,
      credentials: {
        accountId,
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
