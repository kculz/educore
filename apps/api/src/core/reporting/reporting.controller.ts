import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { ReportingService } from './reporting.service';

type RequestWithContext = Request & {
  platformContext?: {
    tenantId: string;
  };
};

@ApiTags('Reporting')
@ApiBearerAuth()
@Controller({ path: 'reports', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'reports.read' })
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('overview')
  overview(@Req() request: RequestWithContext) {
    return this.reportingService.summary(request.platformContext?.tenantId ?? '');
  }
}

