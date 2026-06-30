import { Injectable } from '@nestjs/common';

import { PlatformStateService } from '../platform-state/platform-state.service';

@Injectable()
export class DashboardService {
  constructor(private readonly platformState: PlatformStateService) {}

  overview(tenantId: string) {
    const snapshot = this.platformState.snapshot();
    const tenant = this.platformState.getTenantById(tenantId);
    return {
      tenant,
      snapshot,
      recentNotifications: this.platformState.listNotifications(tenantId).slice(0, 5),
      recentAudits: this.platformState.listAudits(tenantId).slice(0, 10),
    };
  }
}

