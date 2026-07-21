import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, Min, ValidateNested } from 'class-validator';
import { IsTrimmedString } from '../../../../shared/validators/trimmed-string.validator';

export class InvoiceLineDto {
  @ApiProperty({ description: 'Description of the fee item' })
  @IsTrimmedString()
  description!: string;

  @ApiProperty({ description: 'Amount for this item' })
  @IsNumber()
  @Min(0)
  amount!: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Reference ID of the student / applicant' })
  @IsString()
  studentId!: string;

  @ApiProperty({ type: [InvoiceLineDto], description: 'Detailed fee line items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineDto)
  lines!: InvoiceLineDto[];

  @ApiProperty({ description: 'Due date (YYYY-MM-DD)' })
  @IsTrimmedString()
  dueDate!: string;
}
