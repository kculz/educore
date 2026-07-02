import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { CurrentTenantId } from '../platform-access/platform-request.decorator';
import { ProductsService } from './products.service';

@ApiTags('Products')
@ApiBearerAuth()
@Controller({ path: 'products', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'products.read' })
export class ProductsController {
  constructor(@Inject(ProductsService) private readonly productsService: ProductsService) {}

  @Get()
  list() {
    return this.productsService.list();
  }

  @Get('tenant/current')
  listForCurrentTenant(@CurrentTenantId() tenantId: string | null) {
    return this.productsService.listForTenant(tenantId ?? '');
  }

  @Get(':code')
  get(@Param('code') code: string) {
    return this.productsService.get(code);
  }
}
