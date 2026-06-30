import { Body, Controller, Get, Param, Patch, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';
import { FeatureFlagsService } from './feature-flags.service';

type RequestWithContext = Request & {
  platformContext?: {
    tenantId: string;
  };
};

@ApiTags('Feature Flags')
@ApiBearerAuth()
@Controller({ path: 'feature-flags', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'features.read' })
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Get()
  list(@Req() request: RequestWithContext, @Query('productCode') productCode?: string) {
    return this.featureFlagsService.list(request.platformContext?.tenantId ?? '', productCode);
  }

  @Patch(':productCode/:key')
  @AccessScope({ productCode: 'platform', permission: 'features.write' })
  update(
    @Req() request: RequestWithContext,
    @Param('productCode') productCode: string,
    @Param('key') key: string,
    @Body() dto: UpdateFeatureFlagDto,
  ) {
    return this.featureFlagsService.update(request.platformContext?.tenantId ?? '', productCode, key, dto);
  }
}

