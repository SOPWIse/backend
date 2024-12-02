import { Module } from '@nestjs/common';
import { FileManagerService } from './file-manager.service';

@Module({
  providers: [FileManagerService]
})
export class FileManagerModule {}
