import { ApiProperty } from '@nestjs/swagger';
import { IsBase64 } from 'class-validator';

import { IsTrimmedString } from '../../../shared/validators/trimmed-string.validator';

export class StoreFileDto {
  @ApiProperty()
  @IsTrimmedString()
  filename!: string;

  @ApiProperty()
  @IsTrimmedString()
  contentType!: string;

  @ApiProperty({
    description: 'Base64 encoded file contents',
  })
  @IsBase64()
  base64!: string;
}
