import { Controller, Get } from '@nestjs/common';

import { AnonymousRoute, AccessScope } from '../platform-access/platform-access.decorator';
import { HealthService } from './health.service';

@Controller({ path: 'health', version: '1' })
@AnonymousRoute()
@AccessScope({ productCode: 'platform', permission: 'health.read' })
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHealth() {
    return this.healthService.getHealth();
  }
}

