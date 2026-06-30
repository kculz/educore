import { Injectable, NotFoundException } from '@nestjs/common';

import { PlatformStateService } from '../platform-state/platform-state.service';

@Injectable()
export class ProductsService {
  constructor(private readonly platformState: PlatformStateService) {}

  list() {
    return this.platformState.listProducts();
  }

  get(code: string) {
    const product = this.platformState.getProduct(code);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  listForTenant(tenantId: string) {
    const tenant = this.platformState.getTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.platformState.listProducts().map((product) => ({
      ...product,
      enabled: tenant.enabledProducts.includes(product.code),
      licensed: this.platformState.isLicenseEnabled(tenantId, product.code),
    }));
  }
}

