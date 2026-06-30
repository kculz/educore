import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller({ path: 'roles', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'roles.read' })
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  private getTenantId(request: Request & { platformContext?: { tenantId: string } }) {
    return request.platformContext?.tenantId ?? request.header('x-tenant-id') ?? null;
  }

  @Get()
  list(@Query('tenantId') tenantId?: string) {
    return this.rolesService.list(tenantId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.rolesService.get(id);
  }

  @Post()
  @AccessScope({ productCode: 'platform', permission: 'roles.write' })
  create(@Req() request: Request & { platformContext?: { tenantId: string } }, @Body() dto: CreateRoleDto) {
    return this.rolesService.create(this.getTenantId(request), dto);
  }

  @Patch(':id')
  @AccessScope({ productCode: 'platform', permission: 'roles.write' })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }
}
