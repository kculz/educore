import { Inject, Injectable } from '@nestjs/common';

import { PlatformStateService } from '../platform-state/platform-state.service';

export interface AuditRecordInput {
  tenantId: string;
  userId: string | null;
  action: string;
  resource: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditRecorderService {
  constructor(@Inject(PlatformStateService) private readonly platformState: PlatformStateService) {}

  record(input: AuditRecordInput) {
    this.platformState.recordAudit({
      tenantId: input.tenantId,
      userId: input.userId,
      action: input.action,
      resource: input.resource,
      metadata: input.metadata ?? {},
    });
  }
}
