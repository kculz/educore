import { Global, Module } from '@nestjs/common';

import { PlatformStateService } from './platform-state.service';

@Global()
@Module({
  providers: [PlatformStateService],
  exports: [PlatformStateService],
})
export class PlatformStateModule {}

