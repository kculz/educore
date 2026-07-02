import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min, MinLength } from 'class-validator';

import { IsTrimmedString } from '../../../../shared/validators/trimmed-string.validator';

export class CreateProgrammeDto {
  @ApiProperty()
  @IsTrimmedString()
  @MinLength(2)
  code!: string;

  @ApiProperty()
  @IsTrimmedString()
  @MinLength(2)
  name!: string;

  @ApiProperty()
  @IsTrimmedString()
  @MinLength(2)
  level!: string;

  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
