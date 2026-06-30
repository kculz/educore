import { Injectable } from '@nestjs/common';

import { PlatformStateService } from '../platform-state/platform-state.service';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly platformState: PlatformStateService) {}

  list(tenantId?: string) {
    return this.platformState.listSettings(tenantId);
  }

  get(key: string, tenantId: string | null = null) {
    return this.platformState.getSetting(key, tenantId);
  }

  set(key: string, tenantId: string | null, dto: UpdateSettingDto) {
    return this.platformState.setSetting(key, dto.value, tenantId);
  }
}

