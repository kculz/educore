import { Body, Controller, Get, Param, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SettingsService } from './settings.service';

type RequestWithContext = Request & {
  platformContext?: {
    tenantId: string;
  };
};

@ApiTags('Settings')
@ApiBearerAuth()
@Controller({ path: 'settings', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'settings.read' })
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  list(@Req() request: RequestWithContext) {
    return this.settingsService.list(request.platformContext?.tenantId);
  }

  @Get(':key')
  get(@Req() request: RequestWithContext, @Param('key') key: string) {
    return this.settingsService.get(key, request.platformContext?.tenantId ?? null);
  }

  @Put(':key')
  @AccessScope({ productCode: 'platform', permission: 'settings.write' })
  set(@Req() request: RequestWithContext, @Param('key') key: string, @Body() dto: UpdateSettingDto) {
    return this.settingsService.set(key, request.platformContext?.tenantId ?? null, dto);
  }
}

