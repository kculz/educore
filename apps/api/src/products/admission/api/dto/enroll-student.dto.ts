import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, MinLength } from 'class-validator';

import { IsTrimmedString } from '../../../../shared/validators/trimmed-string.validator';

export class EnrollStudentDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsTrimmedString()
  @MinLength(3)
  studentNumber?: string | null;
}
