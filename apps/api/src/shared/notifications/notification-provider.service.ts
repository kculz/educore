import { Injectable } from '@nestjs/common';

export interface EmailNotificationInput {
  tenantId: string;
  recipient: string;
  subject: string;
  template: string;
  payload: Record<string, unknown>;
}

export interface NotificationEnvelope extends EmailNotificationInput {
  channel: 'email';
  status: 'queued';
  createdAt: string;
}

@Injectable()
export class NotificationProviderService {
  createEmailNotification(input: EmailNotificationInput): NotificationEnvelope {
    return {
      ...input,
      channel: 'email',
      status: 'queued',
      createdAt: new Date().toISOString(),
    };
  }
}

