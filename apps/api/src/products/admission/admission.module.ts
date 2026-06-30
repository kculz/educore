import { Module } from '@nestjs/common';

import { PlatformStateModule } from '../../core/platform-state/platform-state.module';
import { SharedModule } from '../../shared/shared.module';
import { AdmissionController } from './api/admission.controller';
import { AdmissionService } from './application/admission.service';
import { AdmissionStoreService } from './infrastructure/admission-store.service';

@Module({
  imports: [PlatformStateModule, SharedModule],
  controllers: [AdmissionController],
  providers: [AdmissionService, AdmissionStoreService],
  exports: [AdmissionService],
})
export class AdmissionModule {}
