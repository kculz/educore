import { Injectable } from '@nestjs/common';

import { PlatformStateService } from '../platform-state/platform-state.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly platformState: PlatformStateService) {}

  list() {
    return this.platformState.listPermissions();
  }
}

