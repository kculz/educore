import { Body, Controller, Get, Inject, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { CurrentTenantId } from '../platform-access/platform-request.decorator';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller({ path: 'settings', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'settings.read' })
export class SettingsController {
  constructor(@Inject(SettingsService) private readonly settingsService: SettingsService) {}

  @Get()
  list(@CurrentTenantId() tenantId: string | null) {
    return this.settingsService.list(tenantId ?? undefined);
  }

  @Get(':key')
  get(@CurrentTenantId() tenantId: string | null, @Param('key') key: string) {
    return this.settingsService.get(key, tenantId ?? null);
  }

  @Put(':key')
  @AccessScope({ productCode: 'platform', permission: 'settings.write' })
  @ApiBody({ type: UpdateSettingDto })
  set(@CurrentTenantId() tenantId: string | null, @Param('key') key: string, @Body() dto: UpdateSettingDto) {
    return this.settingsService.set(key, tenantId ?? null, dto);
  }
}
