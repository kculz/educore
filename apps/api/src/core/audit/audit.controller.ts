import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { CurrentTenantId } from '../platform-access/platform-request.decorator';
import { AuditService } from './audit.service';

@ApiTags('Audit')
@ApiBearerAuth()
@Controller({ path: 'audits', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'audits.read' })
export class AuditController {
  constructor(@Inject(AuditService) private readonly auditService: AuditService) {}

  @Get()
  list(@CurrentTenantId() currentTenantId: string | null, @Query('tenantId') tenantId?: string) {
    return this.auditService.list(tenantId ?? currentTenantId ?? undefined);
  }
}
