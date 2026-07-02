import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, MinLength } from 'class-validator';

import { IsTrimmedString } from '../../../../shared/validators/trimmed-string.validator';

export class CreateApplicationDto {
  @ApiProperty()
  @IsTrimmedString()
  applicantId!: string;

  @ApiProperty()
  @IsTrimmedString()
  programmeId!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsTrimmedString()
  cycleId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsTrimmedString()
  @MinLength(3)
  submissionNotes?: string | null;
}
