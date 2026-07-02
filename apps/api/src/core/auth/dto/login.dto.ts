import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

import { IsTrimmedString } from '../../../shared/validators/trimmed-string.validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@educore.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsTrimmedString()
  @MinLength(8)
  password!: string;
}
