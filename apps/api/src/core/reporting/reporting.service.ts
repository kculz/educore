import { Injectable } from '@nestjs/common';

import { PlatformStateService } from '../platform-state/platform-state.service';

@Injectable()
export class ReportingService {
  constructor(private readonly platformState: PlatformStateService) {}

  summary(tenantId: string) {
    const audits = this.platformState.listAudits(tenantId);
    const notifications = this.platformState.listNotifications(tenantId);
    const users = this.platformState.listUsers(tenantId);
    const roles = this.platformState.listRoles(tenantId);
    const products = this.platformState.listProducts();
    return {
      tenantId,
      users: users.length,
      roles: roles.length,
      products: products.length,
      audits: audits.length,
      notifications: notifications.length,
      generatedAt: new Date().toISOString(),
    };
  }
}

