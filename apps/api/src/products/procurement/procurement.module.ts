import { Module } from '@nestjs/common';

import { AuditModule } from '../../core/audit/audit.module';
import { PlatformStateModule } from '../../core/platform-state/platform-state.module';
import { SharedModule } from '../../shared/shared.module';
import { ProcurementController } from './api/procurement.controller';
import { ProcurementService } from './application/procurement.service';
import { ProcurementStoreService } from './infrastructure/procurement-store.service';

@Module({
  imports: [PlatformStateModule, SharedModule, AuditModule],
  controllers: [ProcurementController],
  providers: [ProcurementService, ProcurementStoreService],
  exports: [ProcurementService],
})
export class ProcurementModule {}
