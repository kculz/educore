import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { DashboardService } from './dashboard.service';

type RequestWithContext = Request & {
  platformContext?: {
    tenantId: string;
  };
};

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller({ path: 'dashboard', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'dashboard.read' })
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  overview(@Req() request: RequestWithContext) {
    return this.dashboardService.overview(request.platformContext?.tenantId ?? '');
  }
}

