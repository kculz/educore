import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { AuditService } from './audit.service';

type RequestWithContext = Request & {
  platformContext?: {
    tenantId: string;
  };
};

@ApiTags('Audit')
@ApiBearerAuth()
@Controller({ path: 'audits', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'audits.read' })
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  list(@Req() request: RequestWithContext, @Query('tenantId') tenantId?: string) {
    return this.auditService.list(tenantId ?? request.platformContext?.tenantId);
  }
}

