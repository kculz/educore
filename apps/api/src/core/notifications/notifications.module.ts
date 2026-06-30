import { Module } from '@nestjs/common';

import { EmailModule } from '../email/email.module';
import { PlatformStateModule } from '../platform-state/platform-state.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [PlatformStateModule, EmailModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

