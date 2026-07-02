import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, MinLength } from 'class-validator';

import { IsTrimmedString } from '../../../../shared/validators/trimmed-string.validator';

export class CreateGuardianDto {
  @ApiProperty()
  @IsTrimmedString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty()
  @IsTrimmedString()
  @MinLength(2)
  relationship!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsTrimmedString()
  phoneNumber?: string | null;
}
