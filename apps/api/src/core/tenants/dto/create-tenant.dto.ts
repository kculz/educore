import { ApiProperty } from '@nestjs/swagger';
import { MinLength } from 'class-validator';

import { IsTrimmedString } from '../../../shared/validators/trimmed-string.validator';

export class CreateTenantDto {
  @ApiProperty()
  @IsTrimmedString()
  @MinLength(3)
  slug!: string;

  @ApiProperty()
  @IsTrimmedString()
  @MinLength(3)
  name!: string;
}
