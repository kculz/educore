import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsObject } from 'class-validator';

import type { EmailTemplateKey } from '../email-template.service';
import { IsTrimmedString } from '../../../shared/validators/trimmed-string.validator';

export class SendEmailDto {
  @ApiProperty()
  @IsEmail()
  to!: string;

  @ApiProperty()
  @IsTrimmedString()
  template!: EmailTemplateKey;

  @ApiProperty({ type: Object })
  @IsObject()
  payload!: Record<string, unknown>;
}
