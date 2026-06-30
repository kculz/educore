import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsObject, IsString } from 'class-validator';

import type { EmailTemplateKey } from '../email-template.service';

export class SendEmailDto {
  @ApiProperty()
  @IsEmail()
  to!: string;

  @ApiProperty()
  @IsString()
  template!: EmailTemplateKey;

  @ApiProperty({ type: Object })
  @IsObject()
  payload!: Record<string, unknown>;
}
