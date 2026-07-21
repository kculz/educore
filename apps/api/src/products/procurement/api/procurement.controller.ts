import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AccessScope } from '../../../core/platform-access/platform-access.decorator';
import { CurrentTenantId, CurrentUserId } from '../../../core/platform-access/platform-request.decorator';
import { ProcurementService } from '../application/procurement.service';
import {
  SupplierDto,
  PurchaseRequestDto,
  PurchaseOrderDto,
  GoodsReceivedNoteDto,
  ProcurementDashboardDto,
  QuotationDto,
  ContractDto,
} from './dto/procurement-response.dto';
import {
  CreateSupplierDto,
  CreatePurchaseRequestDto,
  UpdatePurchaseRequestDto,
  CreatePurchaseOrderDto,
  CreateGrnDto,
  CancelDto,
  UpdateDeliveryDateDto,
  CreateQuotationDto,
  CreateContractDto,
  UpdateContractDto,
} from './dto/procurement-requests.dto';
import { ListProcurementQueryDto } from './dto/list-procurement-query.dto';

@ApiTags('Procurement')
@ApiBearerAuth()
@Controller({ path: 'procurement', version: '1' })
@AccessScope({ productCode: 'procurement', permission: 'procurement.read' })
export class ProcurementController {
  constructor(@Inject(ProcurementService) private readonly procurementService: ProcurementService) {}

  // ─── Dashboard ─────────────────────────────────────────────────────────────

  @Get('dashboard')
  @ApiOkResponse({ type: ProcurementDashboardDto })
  @ApiOperation({ summary: 'Get procurement dashboard metrics' })
  dashboard(@CurrentTenantId() tenantId: string | null) {
    return this.procurementService.dashboard(tenantId ?? '');
  }

  // ─── Suppliers ─────────────────────────────────────────────────────────────

  @Get('suppliers')
  @ApiOkResponse({ type: SupplierDto, isArray: true })
  @ApiOperation({ summary: 'List all suppliers' })
  listSuppliers(@CurrentTenantId() tenantId: string | null, @Query() query: ListProcurementQueryDto) {
    return this.procurementService.listSuppliers(tenantId ?? '', query);
  }

  @Post('suppliers')
  @AccessScope({ productCode: 'procurement', permission: 'procurement.write' })
  @ApiOkResponse({ type: SupplierDto })
  @ApiOperation({ summary: 'Create a new supplier' })
  createSupplier(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Body() dto: CreateSupplierDto,
  ) {
    return this.procurementService.createSupplier(tenantId ?? '', actorUserId ?? null, dto);
  }

  @Get('suppliers/:id')
  @ApiOkResponse({ type: SupplierDto })
  @ApiOperation({ summary: 'Get supplier details' })
  getSupplier(@CurrentTenantId() tenantId: string | null, @Param('id') id: string) {
    return this.procurementService.getSupplier(tenantId ?? '', id);
  }

  @Patch('suppliers/:id')
  @AccessScope({ productCode: 'procurement', permission: 'procurement.write' })
  @ApiOkResponse({ type: SupplierDto })
  @ApiOperation({ summary: 'Update an existing supplier' })
  updateSupplier(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
    @Body() dto: CreateSupplierDto,
  ) {
    return this.procurementService.updateSupplier(tenantId ?? '', actorUserId ?? null, id, dto);
  }

  @Delete('suppliers/:id')
  @AccessScope({ productCode: 'procurement', permission: 'procurement.write' })
  @ApiOkResponse({ type: SupplierDto })
  @ApiOperation({ summary: 'Deactivate a supplier (soft delete)' })
  deleteSupplier(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
  ) {
    return this.procurementService.deleteSupplier(tenantId ?? '', actorUserId ?? null, id);
  }

  // ─── Purchase Requests ─────────────────────────────────────────────────────

  @Get('requests')
  @ApiOkResponse({ type: PurchaseRequestDto, isArray: true })
  @ApiOperation({ summary: 'List all purchase requests' })
  listRequests(@CurrentTenantId() tenantId: string | null, @Query() query: ListProcurementQueryDto) {
    return this.procurementService.listPurchaseRequests(tenantId ?? '', query);
  }

  @Post('requests')
  @AccessScope({ productCode: 'procurement', permission: 'procurement.write' })
  @ApiOkResponse({ type: PurchaseRequestDto })
  @ApiOperation({ summary: 'Create a new purchase request' })
  createRequest(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Body() dto: CreatePurchaseRequestDto,
  ) {
    return this.procurementService.createPurchaseRequest(tenantId ?? '', actorUserId ?? null, actorUserId, dto);
  }

  @Get('requests/:id')
  @ApiOkResponse({ type: PurchaseRequestDto })
  @ApiOperation({ summary: 'Get purchase request details' })
  getRequest(@CurrentTenantId() tenantId: string | null, @Param('id') id: string) {
    return this.procurementService.getPurchaseRequest(tenantId ?? '', id);
  }

  @Patch('requests/:id')
  @AccessScope({ productCode: 'procurement', permission: 'procurement.write' })
  @ApiOkResponse({ type: PurchaseRequestDto })
  @ApiOperation({ summary: 'Update a draft purchase request' })
  updateRequest(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseRequestDto,
  ) {
    return this.procurementService.updatePurchaseRequest(tenantId ?? '', actorUserId ?? null, id, dto);
  }

  @Post('requests/:id/submit')
  @AccessScope({ productCode: 'procurement', permission: 'procurement.write' })
  @ApiOkResponse({ type: PurchaseRequestDto })
  @ApiOperation({ summary: 'Submit a draft purchase request for approval' })
  submitRequest(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
  ) {
    return this.procurementService.submitPurchaseRequest(tenantId ?? '', actorUserId ?? null, id);
  }

  @Post('requests/:id/approve')
  @AccessScope({ productCode: 'procurement', permission: 'procurement.write' })
  @ApiOkResponse({ type: PurchaseRequestDto })
  @ApiOperation({ summary: 'Approve a pending purchase request' })
  approveRequest(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
  ) {
    return this.procurementService.approvePurchaseRequest(tenantId ?? '', actorUserId ?? null, id);
  }

  @Post('requests/:id/reject')
  @AccessScope({ productCode: 'procurement', permission: 'procurement.write' })
  @ApiOkResponse({ type: PurchaseRequestDto })
  @ApiOperation({ summary: 'Reject a pending purchase request' })
  rejectRequest(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
    @Body() dto: CancelDto,
  ) {
    return this.procurementService.rejectPurchaseRequest(tenantId ?? '', actorUserId ?? null, id, dto.reason);
  }

  @Post('requests/:id/cancel')
  @AccessScope({ productCode: 'procurement', permission: 'procurement.write' })
  @ApiOkResponse({ type: PurchaseRequestDto })
  @ApiOperation({ summary: 'Cancel a purchase request (draft or pending)' })
  cancelRequest(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
    @Body() dto: CancelDto,
  ) {
    return this.procurementService.cancelPurchaseRequest(tenantId ?? '', actorUserId ?? null, id, dto.reason);
  }

  // ─── Quotations ────────────────────────────────────────────────────────────

  @Get('quotations')
  @ApiOkResponse({ type: QuotationDto, isArray: true })
  @ApiOperation({ summary: 'List all quotations' })
  listQuotations(@CurrentTenantId() tenantId: string | null, @Query() query: ListProcurementQueryDto) {
    return this.procurementService.listQuotations(tenantId ?? '', query);
  }

  @Post('quotations')
  @AccessScope({ productCode: 'procurement', permission: 'procurement.write' })
  @ApiOkResponse({ type: QuotationDto })
  @ApiOperation({ summary: 'Record a new supplier quotation' })
  createQuotation(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Body() dto: CreateQuotationDto,
  ) {
    return this.procurementService.createQuotation(tenantId ?? '', actorUserId ?? null, dto);
  }

  @Get('quotations/:id')
  @ApiOkResponse({ type: QuotationDto })
  @ApiOperation({ summary: 'Get quotation details' })
  getQuotation(@CurrentTenantId() tenantId: string | null, @Param('id') id: string) {
    return this.procurementService.getQuotation(tenantId ?? '', id);
  }

  @Post('quotations/:id/accept')
  @AccessScope({ productCode: 'procurement', permission: 'procurement.write' })
  @ApiOkResponse({ type: QuotationDto })
  @ApiOperation({ summary: 'Accept a quotation (only one per purchase request can be accepted)' })
  acceptQuotation(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
  ) {
    return this.procurementService.acceptQuotation(tenantId ?? '', actorUserId ?? null, id);
  }

  @Post('quotations/:id/reject')
  @AccessScope({ productCode: 'procurement', permission: 'procurement.write' })
  @ApiOkResponse({ type: QuotationDto })
  @ApiOperation({ summary: 'Reject a quotation' })
  rejectQuotation(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
  ) {
    return this.procurementService.rejectQuotation(tenantId ?? '', actorUserId ?? null, id);
  }

  // ─── Purchase Orders ───────────────────────────────────────────────────────

  @Get('orders')
  @ApiOkResponse({ type: PurchaseOrderDto, isArray: true })
  @ApiOperation({ summary: 'List all purchase orders' })
  listOrders(@CurrentTenantId() tenantId: string | null, @Query() query: ListProcurementQueryDto) {
    return this.procurementService.listPurchaseOrders(tenantId ?? '', query);
  }

  @Post('orders')
  @AccessScope({ productCode: 'procurement', permission: 'procurement.write' })
  @ApiOkResponse({ type: PurchaseOrderDto })
  @ApiOperation({ summary: 'Create a new purchase order' })
  createOrder(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Body() dto: CreatePurchaseOrderDto,
  ) {
    return this.procurementService.createPurchaseOrder(tenantId ?? '', actorUserId ?? null, dto);
  }

  @Get('orders/:id')
  @ApiOkResponse({ type: PurchaseOrderDto })
  @ApiOperation({ summary: 'Get purchase order details' })
  getOrder(@CurrentTenantId() tenantId: string | null, @Param('id') id: string) {
    return this.procurementService.getPurchaseOrder(tenantId ?? '', id);
  }

  @Post('orders/:id/send')
  @AccessScope({ productCode: 'procurement', permission: 'procurement.write' })
  @ApiOkResponse({ type: PurchaseOrderDto })
  @ApiOperation({ summary: 'Mark a purchase order as sent to supplier' })
  sendOrder(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
  ) {
    return this.procurementService.sendPurchaseOrder(tenantId ?? '', actorUserId ?? null, id);
  }

  @Post('orders/:id/cancel')
  @AccessScope({ productCode: 'procurement', permission: 'procurement.write' })
  @ApiOkResponse({ type: PurchaseOrderDto })
  @ApiOperation({ summary: 'Cancel a purchase order (cannot cancel fully received orders)' })
  cancelOrder(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
    @Body() dto: CancelDto,
  ) {
    return this.procurementService.cancelPurchaseOrder(tenantId ?? '', actorUserId ?? null, id, dto.reason);
  }

  @Patch('orders/:id/delivery-date')
  @AccessScope({ productCode: 'procurement', permission: 'procurement.write' })
  @ApiOkResponse({ type: PurchaseOrderDto })
  @ApiOperation({ summary: 'Update the expected delivery date on a purchase order' })
  setDeliveryDate(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryDateDto,
  ) {
    return this.procurementService.setExpectedDeliveryDate(
      tenantId ?? '',
      actorUserId ?? null,
      id,
      dto.expectedDeliveryDate,
    );
  }

  @Post('orders/:id/grn')
  @AccessScope({ productCode: 'procurement', permission: 'procurement.write' })
  @ApiOkResponse({ type: GoodsReceivedNoteDto })
  @ApiOperation({ summary: 'Record delivery of goods (GRN) against a purchase order' })
  receiveGoods(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
    @Body() dto: CreateGrnDto,
  ) {
    return this.procurementService.createGRN(tenantId ?? '', actorUserId ?? null, id, dto);
  }

  @Get('orders/:id/grns')
  @ApiOkResponse({ type: GoodsReceivedNoteDto, isArray: true })
  @ApiOperation({ summary: 'List all GRNs for a specific purchase order' })
  listGRNsByOrder(
    @CurrentTenantId() tenantId: string | null,
    @Param('id') id: string,
    @Query() query: ListProcurementQueryDto,
  ) {
    return this.procurementService.listGRNsByPO(tenantId ?? '', id, query);
  }

  // ─── GRNs ─────────────────────────────────────────────────────────────────

  @Get('grns')
  @ApiOkResponse({ type: GoodsReceivedNoteDto, isArray: true })
  @ApiOperation({ summary: 'List all goods received notes (GRNs)' })
  listGRNs(@CurrentTenantId() tenantId: string | null, @Query() query: ListProcurementQueryDto) {
    return this.procurementService.listGRNs(tenantId ?? '', query);
  }

  @Get('grns/:id')
  @ApiOkResponse({ type: GoodsReceivedNoteDto })
  @ApiOperation({ summary: 'Get a single GRN by ID' })
  getGRN(@CurrentTenantId() tenantId: string | null, @Param('id') id: string) {
    return this.procurementService.getGRN(tenantId ?? '', id);
  }

  // ─── Contracts ────────────────────────────────────────────────────────────

  @Get('contracts')
  @ApiOkResponse({ type: ContractDto, isArray: true })
  @ApiOperation({ summary: 'List all supplier contracts' })
  listContracts(@CurrentTenantId() tenantId: string | null, @Query() query: ListProcurementQueryDto) {
    return this.procurementService.listContracts(tenantId ?? '', query);
  }

  @Post('contracts')
  @AccessScope({ productCode: 'procurement', permission: 'procurement.write' })
  @ApiOkResponse({ type: ContractDto })
  @ApiOperation({ summary: 'Create a new supplier contract' })
  createContract(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Body() dto: CreateContractDto,
  ) {
    return this.procurementService.createContract(tenantId ?? '', actorUserId ?? null, dto);
  }

  @Get('contracts/:id')
  @ApiOkResponse({ type: ContractDto })
  @ApiOperation({ summary: 'Get a contract by ID' })
  getContract(@CurrentTenantId() tenantId: string | null, @Param('id') id: string) {
    return this.procurementService.getContract(tenantId ?? '', id);
  }

  @Patch('contracts/:id')
  @AccessScope({ productCode: 'procurement', permission: 'procurement.write' })
  @ApiOkResponse({ type: ContractDto })
  @ApiOperation({ summary: 'Update a contract (title, value, dates, or status)' })
  updateContract(
    @CurrentTenantId() tenantId: string | null,
    @CurrentUserId() actorUserId: string | null,
    @Param('id') id: string,
    @Body() dto: UpdateContractDto,
  ) {
    return this.procurementService.updateContract(tenantId ?? '', actorUserId ?? null, id, dto);
  }
}
