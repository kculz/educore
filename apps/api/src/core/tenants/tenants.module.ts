import { Module } from '@nestjs/common';

import { PlatformStateModule } from '../platform-state/platform-state.module';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

@Module({
  imports: [PlatformStateModule],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}

