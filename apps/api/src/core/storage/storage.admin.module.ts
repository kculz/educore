import { Module } from '@nestjs/common';

import { StorageModule } from './storage.module';
import { PlatformStateModule } from '../platform-state/platform-state.module';
import { StorageController } from './storage.controller';

@Module({
  imports: [PlatformStateModule, StorageModule],
  controllers: [StorageController],
})
export class StorageAdminModule {}
