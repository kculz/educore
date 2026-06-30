import { Injectable, NotFoundException } from '@nestjs/common';

import { PlatformStateService } from '../platform-state/platform-state.service';
import { UpdateLicenseDto } from './dto/update-license.dto';

@Injectable()
export class LicensingService {
  constructor(private readonly platformState: PlatformStateService) {}

  list(tenantId: string) {
    return this.platformState.listLicenses(tenantId);
  }

  update(tenantId: string, productCode: string, dto: UpdateLicenseDto) {
    const license = this.platformState.setLicense(
      tenantId,
      productCode,
      dto.enabled,
      dto.expiresAt ?? null,
    );
    if (!license) {
      throw new NotFoundException('License not found');
    }
    return license;
  }
}

