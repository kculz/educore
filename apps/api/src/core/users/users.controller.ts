import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller({ path: 'users', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'users.read' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private getTenantId(request: Request & { platformContext?: { tenantId: string } }) {
    return request.platformContext?.tenantId ?? request.header('x-tenant-id') ?? '';
  }

  @Get()
  list(@Query('tenantId') tenantId?: string) {
    return this.usersService.list(tenantId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.usersService.get(id);
  }

  @Post()
  @AccessScope({ productCode: 'platform', permission: 'users.write' })
  create(@Req() request: Request & { platformContext?: { tenantId: string } }, @Body() dto: CreateUserDto) {
    return this.usersService.create(this.getTenantId(request), dto);
  }

  @Patch(':id')
  @AccessScope({ productCode: 'platform', permission: 'users.write' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }
}
