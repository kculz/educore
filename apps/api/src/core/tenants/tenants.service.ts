import { Injectable, NotFoundException } from '@nestjs/common';

import { PlatformStateService } from '../platform-state/platform-state.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantProductsDto } from './dto/update-tenant-products.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly platformState: PlatformStateService) {}

  list() {
    return this.platformState.listTenants();
  }

  get(tenantId: string) {
    const tenant = this.platformState.getTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  create(dto: CreateTenantDto) {
    return this.platformState.createTenant({
      slug: dto.slug,
      name: dto.name,
    });
  }

  updateProducts(tenantId: string, dto: UpdateTenantProductsDto) {
    return this.platformState.updateTenantProducts(tenantId, dto.enabledProducts);
  }
}

