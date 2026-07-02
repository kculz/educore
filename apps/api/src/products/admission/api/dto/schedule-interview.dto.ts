import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, MinLength } from 'class-validator';

import { IsTrimmedString } from '../../../../shared/validators/trimmed-string.validator';

export class ScheduleInterviewDto {
  @ApiProperty()
  @IsTrimmedString()
  scheduledAt!: string;

  @ApiProperty()
  @IsTrimmedString()
  @MinLength(2)
  location!: string;

  @ApiProperty()
  @IsTrimmedString()
  @MinLength(2)
  interviewer!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsTrimmedString()
  notes?: string | null;
}
