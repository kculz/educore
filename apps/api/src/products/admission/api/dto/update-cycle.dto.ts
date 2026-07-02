import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCycleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  academicYear?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ nullable: true, example: '2026-01-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ nullable: true, example: '2026-12-31' })
  @IsOptional()
  @IsString()
  endDate?: string | null;

  @ApiPropertyOptional({ enum: ['draft', 'open', 'closed', 'archived'] })
  @IsOptional()
  @IsIn(['draft', 'open', 'closed', 'archived'])
  status?: 'draft' | 'open' | 'closed' | 'archived';
}
