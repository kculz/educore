import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

import type { EmailTemplateKey } from '../email-template.service';

export class PreviewEmailDto {
  @ApiProperty()
  @IsString()
  template!: EmailTemplateKey;

  @ApiProperty({ type: Object })
  @IsObject()
  payload!: Record<string, unknown>;
}
