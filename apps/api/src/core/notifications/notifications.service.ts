import { Injectable } from '@nestjs/common';

import { EmailService } from '../email/email.service';
import { PlatformStateService } from '../platform-state/platform-state.service';
import { SendEmailNotificationDto } from './dto/send-email-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly platformState: PlatformStateService,
    private readonly emailService: EmailService,
  ) {}

  list(tenantId?: string) {
    return this.platformState.listNotifications(tenantId);
  }

  async sendEmail(tenantId: string, dto: SendEmailNotificationDto) {
    return this.emailService.sendTemplatedEmail({
      tenantId,
      to: dto.to,
      template: dto.template,
      payload: dto.payload,
    });
  }
}
