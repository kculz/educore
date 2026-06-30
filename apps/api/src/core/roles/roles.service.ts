import { Injectable, NotFoundException } from '@nestjs/common';

import { PlatformStateService } from '../platform-state/platform-state.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly platformState: PlatformStateService) {}

  list(tenantId?: string) {
    return this.platformState.listRoles(tenantId);
  }

  get(roleId: string) {
    const role = this.platformState.getRoleById(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  create(tenantId: string | null, dto: CreateRoleDto) {
    return this.platformState.createRole({
      tenantId,
      code: dto.code,
      name: dto.name,
      permissions: dto.permissions,
    });
  }

  update(roleId: string, dto: UpdateRoleDto) {
    return this.platformState.updateRole(roleId, dto);
  }
}
