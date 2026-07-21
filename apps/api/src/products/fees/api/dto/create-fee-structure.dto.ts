import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, Min, MinLength } from 'class-validator';
import { IsTrimmedString } from '../../../../shared/validators/trimmed-string.validator';

export class CreateFeeStructureDto {
  @ApiProperty({ description: 'Name of the fee structure (e.g. Grade 10 Tuition Fee)' })
  @IsTrimmedString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ description: 'Academic year (e.g. 2026/2027)' })
  @IsTrimmedString()
  @MinLength(2)
  academicYear!: string;

  @ApiProperty({ description: 'Total fee amount', minimum: 0 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ enum: ['active', 'archived'], default: 'active' })
  @IsOptional()
  @IsIn(['active', 'archived'])
  status?: 'active' | 'archived';
}
