import { Global, Module } from '@nestjs/common';

import { SharedModule } from '../../shared/shared.module';
import { StorageService } from './storage.service';

@Global()
@Module({
  imports: [SharedModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
