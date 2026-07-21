import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';
import { IsTrimmedString } from '../../../../shared/validators/trimmed-string.validator';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Amount to pay' })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ description: 'Payment method (e.g. stripe, paypal, ecocash, internal)' })
  @IsTrimmedString()
  paymentMethod!: string;
}
