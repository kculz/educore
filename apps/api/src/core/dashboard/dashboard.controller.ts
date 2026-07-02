import { Controller, Get, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { CurrentTenantId } from '../platform-access/platform-request.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller({ path: 'dashboard', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'dashboard.read' })
export class DashboardController {
  constructor(@Inject(DashboardService) private readonly dashboardService: DashboardService) {}

  @Get()
  overview(@CurrentTenantId() tenantId: string | null) {
    return this.dashboardService.overview(tenantId ?? '');
  }
}
