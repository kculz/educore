import { Controller, Get, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { CurrentTenantId } from '../platform-access/platform-request.decorator';
import { ReportingService } from './reporting.service';

@ApiTags('Reporting')
@ApiBearerAuth()
@Controller({ path: 'reports', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'reports.read' })
export class ReportingController {
  constructor(@Inject(ReportingService) private readonly reportingService: ReportingService) {}

  @Get('overview')
  overview(@CurrentTenantId() tenantId: string | null) {
    return this.reportingService.summary(tenantId ?? '');
  }
}
