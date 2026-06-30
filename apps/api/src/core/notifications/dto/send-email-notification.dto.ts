import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';
import type { EmailTemplateKey } from '../../email/email-template.service';

export class SendEmailNotificationDto {
  @ApiProperty()
  @IsString()
  to!: string;

  @ApiProperty({
    example: 'welcome',
    description: 'Template key: welcome, invitation, otp, passwordReset, emailVerification, generalNotification, receipt, invoice, admissionConfirmation',
  })
  @IsString()
  template!: EmailTemplateKey;

  @ApiProperty({ type: Object })
  @IsObject()
  payload!: Record<string, unknown>;
}
