import { Injectable } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';

import { PlatformConfigService } from '../../config/platform-config.service';
import { EmailTemplateKey, EmailTemplateService } from './email-template.service';
import { PlatformStateService } from '../platform-state/platform-state.service';

@Injectable()
export class EmailService {
  private readonly transport: Transporter;

  constructor(
    private readonly config: PlatformConfigService,
    private readonly templates: EmailTemplateService,
    private readonly platformState: PlatformStateService,
  ) {
    this.transport = this.createTransport();
  }

  async sendTemplatedEmail(input: {
    tenantId: string;
    to: string;
    template: EmailTemplateKey;
    payload: Record<string, unknown>;
  }) {
    const rendered = this.templates.render(input.template, input.payload);
    const message = {
      from: this.config.smtpFrom,
      to: input.to,
      subject: rendered.subject,
      html: `<div>${rendered.body}</div>`,
      text: rendered.body,
    };

    const info = await this.transport.sendMail(message);
    const notification = this.platformState.createNotification({
      tenantId: input.tenantId,
      recipient: input.to,
      subject: rendered.subject,
      template: input.template,
      payload: input.payload,
    });
    this.platformState.markNotificationSent(notification.id);
    return {
      messageId: info.messageId,
      subject: rendered.subject,
      body: rendered.body,
      notificationId: notification.id,
    };
  }

  async preview(template: EmailTemplateKey, payload: Record<string, unknown>) {
    return this.templates.render(template, payload);
  }

  private createTransport() {
    if (this.config.smtpHost) {
      return nodemailer.createTransport({
        host: this.config.smtpHost,
        port: this.config.smtpPort,
        secure: this.config.smtpPort === 465,
        auth: this.config.smtpUser
          ? {
              user: this.config.smtpUser,
              pass: this.config.smtpPassword,
            }
          : undefined,
      });
    }

    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }
}

