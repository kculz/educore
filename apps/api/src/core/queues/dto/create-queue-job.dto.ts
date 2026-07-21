import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

import { IsTrimmedString } from '../../../shared/validators/trimmed-string.validator';

export class CreateQueueJobDto {
  @ApiProperty()
  @IsTrimmedString()
  name!: string;

  @ApiProperty({ type: Object })
  @IsObject()
  payload!: Record<string, unknown>;
}
