import { Module } from '@nestjs/common';

import { PlatformStateModule } from '../platform-state/platform-state.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [PlatformStateModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}

