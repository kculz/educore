import { ApiProperty } from '@nestjs/swagger';
import { MinLength } from 'class-validator';

import { IsTrimmedString } from '../../../../shared/validators/trimmed-string.validator';

export class RejectApplicationDto {
  @ApiProperty()
  @IsTrimmedString()
  @MinLength(3)
  reason!: string;
}
