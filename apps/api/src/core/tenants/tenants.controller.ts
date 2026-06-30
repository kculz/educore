import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantProductsDto } from './dto/update-tenant-products.dto';
import { TenantsService } from './tenants.service';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller({ path: 'tenants', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'tenants.read' })
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  list() {
    return this.tenantsService.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.tenantsService.get(id);
  }

  @Post()
  @AccessScope({ productCode: 'platform', permission: 'tenants.write' })
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Patch(':id/products')
  @AccessScope({ productCode: 'platform', permission: 'tenants.write' })
  updateProducts(@Param('id') id: string, @Body() dto: UpdateTenantProductsDto) {
    return this.tenantsService.updateProducts(id, dto);
  }
}

