import { Module } from '@nestjs/common';

import { PlatformStateModule } from '../platform-state/platform-state.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PlatformStateModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

