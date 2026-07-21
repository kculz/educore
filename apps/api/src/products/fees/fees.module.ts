import { Module } from '@nestjs/common';

import { AuditModule } from '../../core/audit/audit.module';
import { PlatformStateModule } from '../../core/platform-state/platform-state.module';
import { SharedModule } from '../../shared/shared.module';
import { FeesController } from './api/fees.controller';
import { FeesService } from './application/fees.service';
import { FeesStoreService } from './infrastructure/fees-store.service';
import { InternalGatewayProvider } from './infrastructure/payment-providers/internal-gateway.provider';

@Module({
  imports: [PlatformStateModule, SharedModule, AuditModule],
  controllers: [FeesController],
  providers: [FeesService, FeesStoreService, InternalGatewayProvider],
  exports: [FeesService],
})
export class FeesModule {}
