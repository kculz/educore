import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsOptional,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { CreateGuardianDto } from './create-guardian.dto';
import { IsTrimmedString } from '../../../../shared/validators/trimmed-string.validator';

export class CreateApplicantDto {
  @ApiProperty()
  @IsTrimmedString()
  @MinLength(2)
  firstName!: string;

  @ApiProperty()
  @IsTrimmedString()
  @MinLength(2)
  lastName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsTrimmedString()
  otherNames?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsTrimmedString()
  phoneNumber?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2012-03-14' })
  @IsOptional()
  @IsTrimmedString()
  dateOfBirth?: string | null;

  @ApiPropertyOptional({ enum: ['male', 'female', 'other', 'prefer_not_to_say'] })
  @IsOptional()
  @IsIn(['male', 'female', 'other', 'prefer_not_to_say'])
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;

  @ApiPropertyOptional({ type: CreateGuardianDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateGuardianDto)
  guardian?: CreateGuardianDto;
}
