import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

import { IsTrimmedString } from '../../../../shared/validators/trimmed-string.validator';

export class ListAdmissionQueryDto {
  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsTrimmedString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsTrimmedString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by applicant id' })
  @IsOptional()
  @IsTrimmedString()
  applicantId?: string;

  @ApiPropertyOptional({ description: 'Filter by cycle id' })
  @IsOptional()
  @IsTrimmedString()
  cycleId?: string;

  @ApiPropertyOptional({ description: 'Filter by programme id' })
  @IsOptional()
  @IsTrimmedString()
  programmeId?: string;

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsTrimmedString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
