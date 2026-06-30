import { Module } from '@nestjs/common';

import { PlatformStateModule } from '../platform-state/platform-state.module';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';

@Module({
  imports: [PlatformStateModule],
  controllers: [ReportingController],
  providers: [ReportingService],
  exports: [ReportingService],
})
export class ReportingModule {}

