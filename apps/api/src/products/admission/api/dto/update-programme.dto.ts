import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min, MinLength } from 'class-validator';

import { IsTrimmedString } from '../../../../shared/validators/trimmed-string.validator';

export class UpdateProgrammeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsTrimmedString()
  @MinLength(2)
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsTrimmedString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsTrimmedString()
  @MinLength(2)
  level?: string;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
