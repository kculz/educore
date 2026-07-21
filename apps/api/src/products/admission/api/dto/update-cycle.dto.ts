import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, MinLength } from 'class-validator';

import { IsTrimmedString } from '../../../../shared/validators/trimmed-string.validator';

export class UpdateCycleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsTrimmedString()
  @MinLength(2)
  academicYear?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsTrimmedString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ nullable: true, example: '2026-01-01' })
  @IsOptional()
  @IsTrimmedString()
  startDate?: string;

  @ApiPropertyOptional({ nullable: true, example: '2026-12-31' })
  @IsOptional()
  @IsTrimmedString()
  endDate?: string | null;

  @ApiPropertyOptional({ enum: ['draft', 'open', 'closed', 'archived'] })
  @IsOptional()
  @IsIn(['draft', 'open', 'closed', 'archived'])
  status?: 'draft' | 'open' | 'closed' | 'archived';
}
