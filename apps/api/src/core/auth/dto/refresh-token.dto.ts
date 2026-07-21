import { ApiProperty } from '@nestjs/swagger';
import { MinLength } from 'class-validator';

import { IsTrimmedString } from '../../../shared/validators/trimmed-string.validator';

export class RefreshTokenDto {
  @ApiProperty()
  @IsTrimmedString()
  @MinLength(20)
  refreshToken!: string;
}
