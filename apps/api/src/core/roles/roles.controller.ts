import { Body, Controller, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { CurrentTenantId } from '../platform-access/platform-request.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller({ path: 'roles', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'roles.read' })
export class RolesController {
  constructor(@Inject(RolesService) private readonly rolesService: RolesService) {}

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
  @ApiBody({ type: CreateRoleDto })
  create(@CurrentTenantId() tenantId: string | null, @Body() dto: CreateRoleDto) {
    return this.rolesService.create(tenantId, dto);
  }

  @Patch(':id')
  @AccessScope({ productCode: 'platform', permission: 'roles.write' })
  @ApiBody({ type: UpdateRoleDto })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }
}
