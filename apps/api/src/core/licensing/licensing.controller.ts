import { Body, Controller, Get, Inject, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { CurrentTenantId } from '../platform-access/platform-request.decorator';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { LicensingService } from './licensing.service';

@ApiTags('Licensing')
@ApiBearerAuth()
@Controller({ path: 'licenses', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'licenses.read' })
export class LicensingController {
  constructor(@Inject(LicensingService) private readonly licensingService: LicensingService) {}

  @Get()
  list(@CurrentTenantId() tenantId: string | null) {
    return this.licensingService.list(tenantId ?? '');
  }

  @Patch(':productCode')
  @AccessScope({ productCode: 'platform', permission: 'licenses.write' })
  @ApiBody({ type: UpdateLicenseDto })
  update(
    @CurrentTenantId() tenantId: string | null,
    @Param('productCode') productCode: string,
    @Body() dto: UpdateLicenseDto,
  ) {
    return this.licensingService.update(tenantId ?? '', productCode, dto);
  }
}
