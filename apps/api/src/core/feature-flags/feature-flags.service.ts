import { Injectable } from '@nestjs/common';

import { PlatformStateService } from '../platform-state/platform-state.service';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';

@Injectable()
export class FeatureFlagsService {
  constructor(private readonly platformState: PlatformStateService) {}

  list(tenantId: string, productCode?: string) {
    return this.platformState.listFeatureFlags(tenantId, productCode);
  }

  update(tenantId: string, productCode: string, key: string, dto: UpdateFeatureFlagDto) {
    return this.platformState.setFeatureFlag(tenantId, productCode, key, dto.enabled);
  }
}

