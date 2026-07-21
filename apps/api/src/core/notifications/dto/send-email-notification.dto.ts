import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsObject } from 'class-validator';
import type { EmailTemplateKey } from '../../email/email-template.service';
import { IsTrimmedString } from '../../../shared/validators/trimmed-string.validator';

export class SendEmailNotificationDto {
  @ApiProperty()
  @IsEmail()
  to!: string;

  @ApiProperty({
    example: 'welcome',
    description: 'Template key: welcome, invitation, otp, passwordReset, emailVerification, generalNotification, receipt, invoice, admissionConfirmation',
  })
  @IsTrimmedString()
  template!: EmailTemplateKey;

  @ApiProperty({ type: Object })
  @IsObject()
  payload!: Record<string, unknown>;
}
