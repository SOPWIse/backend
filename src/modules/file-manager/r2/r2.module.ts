import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { R2ClientFactory } from '@sopwise/modules/file-manager/r2/r2.factory';
import { R2Service } from '@sopwise/modules/file-manager/r2/r2.service';

@Module({
  providers: [R2ClientFactory, ConfigService, R2Service],
})
export class R2Module {}
