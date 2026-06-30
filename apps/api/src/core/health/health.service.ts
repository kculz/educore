import { Injectable } from '@nestjs/common';

import { PlatformConfigService } from '../../config/platform-config.service';
import { PlatformStateService } from '../platform-state/platform-state.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly config: PlatformConfigService,
    private readonly platformState: PlatformStateService,
  ) {}

  getHealth() {
    const snapshot = this.platformState.snapshot();
    return {
      status: 'ok',
      appName: this.config.appName,
      env: this.config.nodeEnv,
      timestamp: new Date().toISOString(),
      snapshot,
    };
  }
}

