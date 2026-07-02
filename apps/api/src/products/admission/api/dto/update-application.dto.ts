import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, MinLength } from 'class-validator';

import { IsTrimmedString } from '../../../../shared/validators/trimmed-string.validator';

export class UpdateApplicationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsTrimmedString()
  @MinLength(1)
  applicantId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsTrimmedString()
  @MinLength(1)
  programmeId?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsTrimmedString()
  @MinLength(1)
  cycleId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsTrimmedString()
  @MinLength(3)
  submissionNotes?: string | null;
}
