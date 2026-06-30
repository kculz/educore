import { Injectable } from '@nestjs/common';

import { PlatformStateService } from '../platform-state/platform-state.service';

@Injectable()
export class AuditService {
  constructor(private readonly platformState: PlatformStateService) {}

  list(tenantId?: string) {
    return this.platformState.listAudits(tenantId);
  }
}

