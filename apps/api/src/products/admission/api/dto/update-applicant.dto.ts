import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, MinLength, ValidateNested } from 'class-validator';

import { CreateGuardianDto } from './create-guardian.dto';
import { IsTrimmedString } from '../../../../shared/validators/trimmed-string.validator';

export class UpdateApplicantDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsTrimmedString()
  @MinLength(2)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsTrimmedString()
  @MinLength(2)
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsTrimmedString()
  otherNames?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsTrimmedString()
  phoneNumber?: string | null;

  @ApiPropertyOptional({ nullable: true })
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
  guardian?: CreateGuardianDto | null;

  @ApiPropertyOptional({ enum: ['draft', 'submitted', 'approved', 'rejected', 'offered', 'accepted', 'enrolled', 'withdrawn'] })
  @IsOptional()
  @IsIn(['draft', 'submitted', 'approved', 'rejected', 'offered', 'accepted', 'enrolled', 'withdrawn'])
  status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'offered' | 'accepted' | 'enrolled' | 'withdrawn';
}
