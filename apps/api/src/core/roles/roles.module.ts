import { Module } from '@nestjs/common';

import { PlatformStateModule } from '../platform-state/platform-state.module';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [PlatformStateModule],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}

