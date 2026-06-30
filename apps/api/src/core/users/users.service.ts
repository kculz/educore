import { Injectable, NotFoundException } from '@nestjs/common';

import { PlatformStateService } from '../platform-state/platform-state.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly platformState: PlatformStateService) {}

  list(tenantId?: string) {
    return this.platformState.listUsers(tenantId);
  }

  get(userId: string) {
    const user = this.platformState.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  create(tenantId: string, dto: CreateUserDto) {
    return this.platformState.createUser({
      tenantId,
      email: dto.email,
      fullName: dto.fullName,
      password: dto.password,
      roleIds: dto.roleIds ?? [],
    });
  }

  update(userId: string, dto: UpdateUserDto) {
    return this.platformState.updateUser(userId, dto);
  }
}
