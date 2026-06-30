import { Module } from '@nestjs/common';

import { PlatformStateModule } from '../platform-state/platform-state.module';
import { LicensingController } from './licensing.controller';
import { LicensingService } from './licensing.service';

@Module({
  imports: [PlatformStateModule],
  controllers: [LicensingController],
  providers: [LicensingService],
  exports: [LicensingService],
})
export class LicensingModule {}

