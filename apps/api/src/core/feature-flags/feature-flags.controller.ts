import { Body, Controller, Get, Inject, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { CurrentTenantId } from '../platform-access/platform-request.decorator';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';
import { FeatureFlagsService } from './feature-flags.service';

@ApiTags('Feature Flags')
@ApiBearerAuth()
@Controller({ path: 'feature-flags', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'features.read' })
export class FeatureFlagsController {
  constructor(
    @Inject(FeatureFlagsService) private readonly featureFlagsService: FeatureFlagsService,
  ) {}

  @Get()
  list(@CurrentTenantId() tenantId: string | null, @Query('productCode') productCode?: string) {
    return this.featureFlagsService.list(tenantId ?? '', productCode);
  }

  @Patch(':productCode/:key')
  @AccessScope({ productCode: 'platform', permission: 'features.write' })
  @ApiBody({ type: UpdateFeatureFlagDto })
  update(
    @CurrentTenantId() tenantId: string | null,
    @Param('productCode') productCode: string,
    @Param('key') key: string,
    @Body() dto: UpdateFeatureFlagDto,
  ) {
    return this.featureFlagsService.update(tenantId ?? '', productCode, key, dto);
  }
}
