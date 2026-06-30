import { Module } from '@nestjs/common';

import { PlatformStateModule } from '../platform-state/platform-state.module';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';

@Module({
  imports: [PlatformStateModule],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}

