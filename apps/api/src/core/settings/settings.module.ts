import { Module } from '@nestjs/common';

import { PlatformStateModule } from '../platform-state/platform-state.module';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [PlatformStateModule],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}

