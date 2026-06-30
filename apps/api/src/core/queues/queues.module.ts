import { Global, Module } from '@nestjs/common';

import { SharedModule } from '../../shared/shared.module';
import { QueuesService } from './queues.service';

@Global()
@Module({
  imports: [SharedModule],
  providers: [QueuesService],
  exports: [QueuesService],
})
export class QueuesModule {}
