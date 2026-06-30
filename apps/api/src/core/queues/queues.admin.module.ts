import { Module } from '@nestjs/common';

import { QueuesModule } from './queues.module';
import { PlatformStateModule } from '../platform-state/platform-state.module';
import { QueuesController } from './queues.controller';

@Module({
  imports: [PlatformStateModule, QueuesModule],
  controllers: [QueuesController],
})
export class QueuesAdminModule {}
