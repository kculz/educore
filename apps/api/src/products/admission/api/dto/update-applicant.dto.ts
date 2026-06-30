import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';

import { CreateGuardianDto } from './create-guardian.dto';

export class UpdateApplicantDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  otherNames?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  phoneNumber?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
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

