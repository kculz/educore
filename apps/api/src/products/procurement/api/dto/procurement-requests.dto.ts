import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { IsTrimmedString } from '../../../../shared/validators/trimmed-string.validator';

// ─── Supplier ──────────────────────────────────────────────────────────────

export class SupplierBankDetailsDto {
  @ApiProperty({ description: 'Name of the bank' })
  @IsTrimmedString()
  bankName!: string;

  @ApiProperty({ description: 'Account holder name' })
  @IsTrimmedString()
  accountName!: string;

  @ApiProperty({ description: 'Bank account number' })
  @IsTrimmedString()
  accountNumber!: string;
}

export class CreateSupplierDto {
  @ApiProperty({ description: 'Supplier company name' })
  @IsTrimmedString()
  name!: string;

  @ApiPropertyOptional({ description: 'Main contact person name' })
  @IsOptional()
  @IsTrimmedString()
  contactName?: string;

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsOptional()
  @IsTrimmedString()
  email?: string;

  @ApiPropertyOptional({ description: 'Contact phone number' })
  @IsOptional()
  @IsTrimmedString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Physical or postal address' })
  @IsOptional()
  @IsTrimmedString()
  address?: string;

  @ApiPropertyOptional({ description: 'Tax/VAT identification number' })
  @IsOptional()
  @IsTrimmedString()
  taxId?: string;

  @ApiPropertyOptional({ description: 'Supplier category (e.g. Stationery, IT, Catering)' })
  @IsOptional()
  @IsTrimmedString()
  category?: string;

  @ApiPropertyOptional({ type: SupplierBankDetailsDto, description: 'Banking details for payment' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SupplierBankDetailsDto)
  bankDetails?: SupplierBankDetailsDto;

  @ApiPropertyOptional({ description: 'Performance rating (1-5)', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ enum: ['active', 'inactive'], default: 'active' })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';
}

// ─── Purchase Request ───────────────────────────────────────────────────────

export class PurchaseRequestItemDto {
  @ApiProperty({ description: 'Item name' })
  @IsTrimmedString()
  name!: string;

  @ApiProperty({ description: 'Quantity requested' })
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiProperty({ description: 'Estimated unit cost' })
  @IsNumber()
  @Min(0)
  estimatedUnitCost!: number;
}

export class CreatePurchaseRequestDto {
  @ApiProperty({ description: 'Title of the request' })
  @IsTrimmedString()
  title!: string;

  @ApiPropertyOptional({ description: 'Detailed description' })
  @IsOptional()
  @IsTrimmedString()
  description?: string;

  @ApiProperty({ type: [PurchaseRequestItemDto], description: 'Items requested' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseRequestItemDto)
  items!: PurchaseRequestItemDto[];
}

export class UpdatePurchaseRequestDto {
  @ApiPropertyOptional({ description: 'Updated title' })
  @IsOptional()
  @IsTrimmedString()
  title?: string;

  @ApiPropertyOptional({ description: 'Updated description' })
  @IsOptional()
  @IsTrimmedString()
  description?: string;

  @ApiPropertyOptional({ type: [PurchaseRequestItemDto], description: 'Updated items list' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseRequestItemDto)
  items?: PurchaseRequestItemDto[];
}

// ─── Cancel ─────────────────────────────────────────────────────────────────

export class CancelDto {
  @ApiPropertyOptional({ description: 'Reason for cancellation' })
  @IsOptional()
  @IsTrimmedString()
  reason?: string;
}

// ─── Quotation ───────────────────────────────────────────────────────────────

export class QuotationItemDto {
  @ApiProperty({ description: 'Item name' })
  @IsTrimmedString()
  name!: string;

  @ApiProperty({ description: 'Quantity quoted' })
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiProperty({ description: 'Unit cost quoted' })
  @IsNumber()
  @Min(0)
  unitCost!: number;
}

export class CreateQuotationDto {
  @ApiProperty({ description: 'Supplier ID providing the quotation' })
  @IsString()
  supplierId!: string;

  @ApiPropertyOptional({ description: 'Reference Purchase Request ID' })
  @IsOptional()
  @IsString()
  purchaseRequestId?: string;

  @ApiPropertyOptional({ description: 'Supplier-provided quote reference number' })
  @IsOptional()
  @IsTrimmedString()
  quoteReference?: string;

  @ApiProperty({ type: [QuotationItemDto], description: 'Quoted line items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items!: QuotationItemDto[];

  @ApiPropertyOptional({ description: 'Quote validity date (YYYY-MM-DD)' })
  @IsOptional()
  @IsTrimmedString()
  validUntil?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsTrimmedString()
  notes?: string;
}

export class UpdateQuotationStatusDto {
  @ApiProperty({ enum: ['received', 'accepted', 'rejected'] })
  @IsIn(['received', 'accepted', 'rejected'])
  status!: 'received' | 'accepted' | 'rejected';
}

// ─── Purchase Order ───────────────────────────────────────────────────────────

export class PurchaseOrderItemDto {
  @ApiProperty({ description: 'Item name' })
  @IsTrimmedString()
  name!: string;

  @ApiProperty({ description: 'Quantity ordered' })
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiProperty({ description: 'Agreed unit cost' })
  @IsNumber()
  @Min(0)
  unitCost!: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ description: 'Supplier ID' })
  @IsString()
  supplierId!: string;

  @ApiPropertyOptional({ description: 'Reference Purchase Request ID' })
  @IsOptional()
  @IsString()
  purchaseRequestId?: string;

  @ApiPropertyOptional({ description: 'Reference Quotation ID' })
  @IsOptional()
  @IsString()
  quotationId?: string;

  @ApiProperty({ type: [PurchaseOrderItemDto], description: 'Items ordered' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items!: PurchaseOrderItemDto[];

  @ApiPropertyOptional({ description: 'Expected delivery date (YYYY-MM-DD)' })
  @IsOptional()
  @IsTrimmedString()
  expectedDeliveryDate?: string;
}

export class UpdateDeliveryDateDto {
  @ApiProperty({ description: 'New expected delivery date (YYYY-MM-DD)' })
  @IsTrimmedString()
  expectedDeliveryDate!: string;
}

// ─── GRN ──────────────────────────────────────────────────────────────────────

export class GrnReceivedItemDto {
  @ApiProperty({ description: 'Item name matching the PO item' })
  @IsTrimmedString()
  name!: string;

  @ApiProperty({ description: 'Quantity received' })
  @IsNumber()
  @Min(1)
  quantityReceived!: number;
}

export class CreateGrnDto {
  @ApiProperty({ type: [GrnReceivedItemDto], description: 'Items received in this delivery' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GrnReceivedItemDto)
  receivedItems!: GrnReceivedItemDto[];

  @ApiPropertyOptional({ description: 'Receiving / inspection notes' })
  @IsOptional()
  @IsTrimmedString()
  notes?: string;
}

// ─── Contract ────────────────────────────────────────────────────────────────

export class CreateContractDto {
  @ApiProperty({ description: 'Supplier ID the contract is with' })
  @IsString()
  supplierId!: string;

  @ApiPropertyOptional({ description: 'Related Purchase Order ID' })
  @IsOptional()
  @IsString()
  purchaseOrderId?: string;

  @ApiProperty({ description: 'Contract title / name' })
  @IsTrimmedString()
  title!: string;

  @ApiPropertyOptional({ description: 'Description / scope of contract' })
  @IsOptional()
  @IsTrimmedString()
  description?: string;

  @ApiProperty({ description: 'Total contract value', minimum: 0 })
  @IsNumber()
  @Min(0)
  value!: number;

  @ApiProperty({ description: 'Contract start date (YYYY-MM-DD)' })
  @IsTrimmedString()
  startDate!: string;

  @ApiProperty({ description: 'Contract end date (YYYY-MM-DD)' })
  @IsTrimmedString()
  endDate!: string;
}

export class UpdateContractDto {
  @ApiPropertyOptional({ description: 'Updated title' })
  @IsOptional()
  @IsTrimmedString()
  title?: string;

  @ApiPropertyOptional({ description: 'Updated description' })
  @IsOptional()
  @IsTrimmedString()
  description?: string;

  @ApiPropertyOptional({ description: 'Updated contract value', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @ApiPropertyOptional({ description: 'Updated start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsTrimmedString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Updated end date (YYYY-MM-DD)' })
  @IsOptional()
  @IsTrimmedString()
  endDate?: string;

  @ApiPropertyOptional({ enum: ['draft', 'active', 'expired', 'terminated'] })
  @IsOptional()
  @IsIn(['draft', 'active', 'expired', 'terminated'])
  status?: 'draft' | 'active' | 'expired' | 'terminated';
}
