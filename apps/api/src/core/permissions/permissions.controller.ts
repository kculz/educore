import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { PermissionsService } from './permissions.service';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller({ path: 'permissions', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'permissions.read' })
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  list() {
    return this.permissionsService.list();
  }
}

