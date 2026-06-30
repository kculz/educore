import { Module } from '@nestjs/common';

import { PlatformStateModule } from '../platform-state/platform-state.module';
import { FeatureFlagsController } from './feature-flags.controller';
import { FeatureFlagsService } from './feature-flags.service';

@Module({
  imports: [PlatformStateModule],
  controllers: [FeatureFlagsController],
  providers: [FeatureFlagsService],
  exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {}

