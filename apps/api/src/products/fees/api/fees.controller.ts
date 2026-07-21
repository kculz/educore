import { Body, Controller, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AccessScope } from '../../../core/platform-access/platform-access.decorator';
import { CurrentTenantId, CurrentUserId } from '../../../core/platform-access/platform-request.decorator';
import { FeesService } from '../application/fees.service';
import {
  FeeStructureDto,
  InvoiceDto,
  PaymentDto,
  ReceiptDto,
  StudentBalanceDto,
  FeesDashboardDto,
} from './dto/fees-response.dto';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ListFeesQueryDto } from './dto/list-fees-query.dto';

@ApiTags('Fees')
@ApiBearerAuth()
@Controller({ path: 'fees', version: '1' })
@AccessScope({ productCode: 'fees', permission: 'fees.read' })
export class FeesController {
  constructor(@Inject(FeesService) private readonly feesService: FeesService) {}

  @Get('dashboard')
  @ApiOkResponse({ type: FeesDashboardDto })
  @ApiOperation({ summary: 'Get fees dashboard metrics' })
  dashboard(@CurrentTenantId() tenantId: string | null) {
    return this.feesService.dashboard(tenantId ?? '');
  }

  @Get('structures')
  @ApiOkResponse({ type: FeeStructureDto, isArray: true })
  @ApiOperation({ summary: 'List all fee structures' })
  listStructures(@CurrentTenantId() tenantId: string | null, @Query() query: ListFeesQueryDto) {
    return this.feesService.listFeeStructures(tenantId ?? '', query);
  }

  @Post('structures')
  @AccessScope({ productCode: 'fees', permission: 'fees.write' })
  @ApiOkResponse({ type: FeeStructureDto })
  @ApiOperation({ summary: 'Create a new fee structure definition' })
  createStructure(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Body() dto: CreateFeeStructureDto,
  ) {
    return this.feesService.createFeeStructure(tenantId ?? '', actorUserId ?? null, dto);
  }

  @Get('structures/:id')
  @ApiOkResponse({ type: FeeStructureDto })
  @ApiOperation({ summary: 'Get a specific fee structure details' })
  getStructure(@CurrentTenantId() tenantId: string | null, @Param('id') id: string) {
    return this.feesService.getFeeStructure(tenantId ?? '', id);
  }

  @Patch('structures/:id')
  @AccessScope({ productCode: 'fees', permission: 'fees.write' })
  @ApiOkResponse({ type: FeeStructureDto })
  @ApiOperation({ summary: 'Update an existing fee structure definition' })
  updateStructure(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
    @Body() dto: CreateFeeStructureDto, // reusing create DTO for update fields
  ) {
    return this.feesService.updateFeeStructure(tenantId ?? '', actorUserId ?? null, id, dto);
  }

  @Get('invoices')
  @ApiOkResponse({ type: InvoiceDto, isArray: true })
  @ApiOperation({ summary: 'List all invoices' })
  listInvoices(@CurrentTenantId() tenantId: string | null, @Query() query: ListFeesQueryDto) {
    return this.feesService.listInvoices(tenantId ?? '', query);
  }

  @Post('invoices')
  @AccessScope({ productCode: 'fees', permission: 'fees.write' })
  @ApiOkResponse({ type: InvoiceDto })
  @ApiOperation({ summary: 'Create / issue a new invoice' })
  createInvoice(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.feesService.createInvoice(tenantId ?? '', actorUserId ?? null, dto);
  }

  @Get('invoices/:id')
  @ApiOkResponse({ type: InvoiceDto })
  @ApiOperation({ summary: 'Get details of an invoice' })
  getInvoice(@CurrentTenantId() tenantId: string | null, @Param('id') id: string) {
    return this.feesService.getInvoice(tenantId ?? '', id);
  }

  @Post('invoices/:id/pay')
  @AccessScope({ productCode: 'fees', permission: 'fees.write' })
  @ApiOkResponse({ type: PaymentDto })
  @ApiOperation({ summary: 'Process a payment against an invoice' })
  payInvoice(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.feesService.payInvoice(tenantId ?? '', actorUserId ?? null, id, dto);
  }

  @Get('balances/:studentId')
  @ApiOkResponse({ type: StudentBalanceDto })
  @ApiOperation({ summary: 'Get total billing outstanding balance of a student' })
  studentBalance(@CurrentTenantId() tenantId: string | null, @Param('studentId') studentId: string) {
    return this.feesService.getStudentBalance(tenantId ?? '', studentId);
  }

  @Get('payments')
  @ApiOkResponse({ type: PaymentDto, isArray: true })
  @ApiOperation({ summary: 'List all payments' })
  listPayments(@CurrentTenantId() tenantId: string | null, @Query() query: ListFeesQueryDto) {
    return this.feesService.listPayments(tenantId ?? '', query);
  }

  @Get('receipts')
  @ApiOkResponse({ type: ReceiptDto, isArray: true })
  @ApiOperation({ summary: 'List all receipts' })
  listReceipts(@CurrentTenantId() tenantId: string | null, @Query() query: ListFeesQueryDto) {
    return this.feesService.listReceipts(tenantId ?? '', query);
  }
}
