import { Body, Controller, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { CurrentTenantId } from '../platform-access/platform-request.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller({ path: 'users', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'users.read' })
export class UsersController {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

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
  @ApiBody({ type: CreateUserDto })
  create(@CurrentTenantId() tenantId: string | null, @Body() dto: CreateUserDto) {
    return this.usersService.create(tenantId ?? '', dto);
  }

  @Patch(':id')
  @AccessScope({ productCode: 'platform', permission: 'users.write' })
  @ApiBody({ type: UpdateUserDto })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }
}
