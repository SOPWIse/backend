import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { R2ClientFactory } from '@sopwise/modules/file-manager/r2/r2.factory';
import { R2Service } from '@sopwise/modules/file-manager/r2/r2.service';
import { FileManagerService } from './file-manager.service';

@Module({
  providers: [FileManagerService, ConfigService, R2ClientFactory, R2Service],
  exports: [FileManagerService],
})
export class FileManagerModule {}
