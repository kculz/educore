import { Body, Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { LicensingService } from './licensing.service';

type RequestWithContext = Request & {
  platformContext?: {
    tenantId: string;
  };
};

@ApiTags('Licensing')
@ApiBearerAuth()
@Controller({ path: 'licenses', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'licenses.read' })
export class LicensingController {
  constructor(private readonly licensingService: LicensingService) {}

  @Get()
  list(@Req() request: RequestWithContext) {
    return this.licensingService.list(request.platformContext?.tenantId ?? '');
  }

  @Patch(':productCode')
  @AccessScope({ productCode: 'platform', permission: 'licenses.write' })
  update(
    @Req() request: RequestWithContext,
    @Param('productCode') productCode: string,
    @Body() dto: UpdateLicenseDto,
  ) {
    return this.licensingService.update(request.platformContext?.tenantId ?? '', productCode, dto);
  }
}

