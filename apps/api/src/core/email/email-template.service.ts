import { Injectable } from '@nestjs/common';
import Handlebars from 'handlebars';

const templates = {
  welcome: {
    subject: 'Welcome to EduCore',
    body: 'Hello {{name}}, welcome to EduCore.',
  },
  invitation: {
    subject: 'You have been invited to EduCore',
    body: 'Hello {{name}}, your invitation for {{tenantName}} is ready.',
  },
  otp: {
    subject: 'Your EduCore verification code',
    body: 'Hello {{name}}, your OTP code is {{code}}.',
  },
  passwordReset: {
    subject: 'Reset your EduCore password',
    body: 'Hello {{name}}, use this link to reset your password: {{link}}',
  },
  emailVerification: {
    subject: 'Verify your EduCore email address',
    body: 'Hello {{name}}, verify your email using this link: {{link}}',
  },
  generalNotification: {
    subject: '{{subject}}',
    body: '{{message}}',
  },
  receipt: {
    subject: 'EduCore Receipt',
    body: 'Hello {{name}}, your receipt {{reference}} is ready.',
  },
  invoice: {
    subject: 'EduCore Invoice',
    body: 'Hello {{name}}, your invoice {{reference}} is ready.',
  },
  admissionConfirmation: {
    subject: 'Admission Confirmation',
    body: 'Hello {{name}}, your admission has been confirmed.',
  },
} as const;

export type EmailTemplateKey = keyof typeof templates;

@Injectable()
export class EmailTemplateService {
  render(template: EmailTemplateKey, payload: Record<string, unknown>) {
    const definition = templates[template];
    const subject = Handlebars.compile(definition.subject)(payload);
    const body = Handlebars.compile(definition.body)(payload);
    return { subject, body };
  }
}

