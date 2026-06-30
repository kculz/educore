import { Module } from '@nestjs/common';

import { PlatformStateModule } from '../platform-state/platform-state.module';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

@Module({
  imports: [PlatformStateModule],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}

