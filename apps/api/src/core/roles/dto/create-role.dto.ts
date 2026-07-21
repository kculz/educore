import { ApiProperty } from '@nestjs/swagger';
import { IsArray, MinLength } from 'class-validator';

import { IsTrimmedString } from '../../../shared/validators/trimmed-string.validator';

export class CreateRoleDto {
  @ApiProperty()
  @IsTrimmedString()
  @MinLength(2)
  code!: string;

  @ApiProperty()
  @IsTrimmedString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  permissions!: string[];
}
