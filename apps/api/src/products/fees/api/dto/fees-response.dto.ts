import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FeeStructureDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  academicYear!: string;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class InvoiceLineDto {
  @ApiProperty()
  description!: string;

  @ApiProperty()
  amount!: number;
}

export class InvoiceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  studentId!: string;

  @ApiProperty()
  invoiceNumber!: string;

  @ApiProperty({ type: [InvoiceLineDto] })
  lines!: InvoiceLineDto[];

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  amountPaid!: number;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  dueDate!: string;

  @ApiProperty()
  issuedAt!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class PaymentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  invoiceId!: string;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  paymentMethod!: string;

  @ApiProperty()
  transactionReference!: string;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional({ nullable: true })
  completedAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class ReceiptDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  paymentId!: string;

  @ApiProperty()
  invoiceId!: string;

  @ApiProperty()
  receiptNumber!: string;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  issuedAt!: string;

  @ApiProperty()
  createdAt!: string;
}

export class StudentBalanceDto {
  @ApiProperty()
  studentId!: string;

  @ApiProperty()
  totalBilled!: number;

  @ApiProperty()
  totalPaid!: number;

  @ApiProperty()
  balance!: number;
}

export class FeesDashboardDto {
  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  tenantName!: string;

  @ApiProperty()
  totalBilled!: number;

  @ApiProperty()
  totalPaid!: number;

  @ApiProperty()
  outstandingBalance!: number;

  @ApiProperty()
  invoiceCount!: number;

  @ApiProperty()
  paymentCount!: number;

  @ApiProperty()
  collectionRate!: number;
}
