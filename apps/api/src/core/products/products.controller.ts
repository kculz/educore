import { Controller, Get, Param, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { ProductsService } from './products.service';

type RequestWithContext = Request & {
  platformContext?: {
    tenantId: string;
  };
};

@ApiTags('Products')
@ApiBearerAuth()
@Controller({ path: 'products', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'products.read' })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list() {
    return this.productsService.list();
  }

  @Get('tenant/current')
  listForCurrentTenant(@Req() request: RequestWithContext) {
    return this.productsService.listForTenant(request.platformContext?.tenantId ?? '');
  }

  @Get(':code')
  get(@Param('code') code: string) {
    return this.productsService.get(code);
  }
}
