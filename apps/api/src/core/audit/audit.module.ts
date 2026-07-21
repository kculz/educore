import { Module } from '@nestjs/common';

import { PlatformStateModule } from '../platform-state/platform-state.module';
import { AuditController } from './audit.controller';
import { AuditRecorderService } from './audit-recorder.service';
import { AuditService } from './audit.service';

@Module({
  imports: [PlatformStateModule],
  controllers: [AuditController],
  providers: [AuditService, AuditRecorderService],
  exports: [AuditService, AuditRecorderService],
})
export class AuditModule {}
