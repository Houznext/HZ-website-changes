import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { randomBytes } from 'crypto';
import { InvoiceEstimator, InvoiceStatus } from './entities/invoice-estimator.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { InvoicePayment } from './entities/invoice-payment.entity';
import { InvoiceAuditLog } from './entities/invoice-audit-log.entity';
import { User } from 'src/user/entities/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { CostEstimator } from 'src/cost-estimator/entities/cost-estimator.entity';
import { RequestUser } from 'src/guard';
import { mobileSuffix10, sqlMobileSuffixMatch } from 'src/common/phone.util';
import {
  GSTIN_REGEX,
  stateCodeFromGstin,
  VALID_GST_RATES,
  VALID_STATE_CODES,
} from './constants/indian-states.constant';
import {
  calculateInvoice,
  LineItemInput,
  round2,
} from './utils/invoice-calculation.util';
import {
  CancelInvoiceDto,
  CreateInvoiceDto,
  InvoiceItemInputDto,
  InvoiceListFilterDto,
  RecordPaymentDto,
  SendInvoiceDto,
  UpdateInvoiceDto,
} from './dto/invoice.dto';
import { InvoicePdfService } from './invoice-pdf.service';
import { MailerService } from 'src/sendEmail.service';
import { WhatsAppMsgService } from 'src/whatsApp.service';
import { S3Service } from 'src/common/s3/s3.service';
import {
  formatInvoiceSeriesNumber,
  parseInvoiceSeriesNumber,
} from './utils/invoice-number.util';

const COMPUTED_KEYS = [
  'subtotal',
  'total_item_discount',
  'invoice_discount_amount',
  'taxable_value',
  'cgst_amount',
  'sgst_amount',
  'igst_amount',
  'total_tax',
  'round_off',
  'grand_total',
  'amount_in_words',
] as const;

function normalizeMobile(m: string): string {
  const digits = m.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return digits.slice(-10);
}

function validateItemInput(item: InvoiceItemInputDto): void {
  if (!VALID_GST_RATES.includes((item.gst_rate ?? 18) as (typeof VALID_GST_RATES)[number])) {
    throw new BadRequestException('Invalid gst_rate');
  }
  if (item.pricing_mode === 'unit') {
    if (item.quantity == null || item.unit_price == null) {
      throw new BadRequestException('Unit mode requires quantity and unit_price');
    }
    if (Number(item.quantity) <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }
  } else {
    if (item.area_value == null || item.rate_per_unit == null) {
      throw new BadRequestException('Area mode requires area_value and rate_per_unit');
    }
  }
  if (item.hsn_sac_code && !/^[0-9]{4,8}$/.test(item.hsn_sac_code)) {
    throw new BadRequestException('Invalid HSN/SAC code');
  }
}

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(InvoiceEstimator)
    private readonly invoiceRepo: Repository<InvoiceEstimator>,
    @InjectRepository(InvoiceItem)
    private readonly itemRepo: Repository<InvoiceItem>,
    @InjectRepository(InvoicePayment)
    private readonly paymentRepo: Repository<InvoicePayment>,
    @InjectRepository(InvoiceAuditLog)
    private readonly auditRepo: Repository<InvoiceAuditLog>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    @InjectRepository(CostEstimator)
    private readonly quotationRepo: Repository<CostEstimator>,
    private readonly pdfService: InvoicePdfService,
    private readonly mailerService: MailerService,
    private readonly whatsAppService: WhatsAppMsgService,
    private readonly s3Service: S3Service,
  ) {}

  private stripComputed<T extends object>(dto: T): T {
    const copy = { ...dto } as Record<string, unknown>;
    for (const k of COMPUTED_KEYS) delete copy[k];
    return copy as T;
  }

  private toLineInput(item: InvoiceItemInputDto): LineItemInput {
    return {
      pricing_mode: item.pricing_mode,
      quantity: item.quantity,
      unit_price: item.unit_price,
      area_value: item.area_value,
      rate_per_unit: item.rate_per_unit,
      item_discount_type: item.item_discount_type,
      item_discount_value: item.item_discount_value,
      gst_rate: item.gst_rate ?? 18,
    };
  }

  private async snapshotSupplier(branchId?: string | null) {
    const defaults = {
      supplierName: 'Houznext Interiors Pvt Ltd',
      supplierGstin: process.env.HOUZNEXT_GSTIN || '36AABCH9876F1Z2',
      supplierAddress:
        process.env.HOUZNEXT_ADDRESS ||
        'Plot 18, Hitech City Road, Hyderabad — 500081',
      supplierState: 'Telangana',
      supplierStateCode: '36',
      supplierPan: process.env.HOUZNEXT_PAN || null,
      supplierBankName: process.env.HOUZNEXT_BANK_NAME || 'HDFC Bank, Hitech City',
      supplierBankAccount: process.env.HOUZNEXT_BANK_ACCOUNT || null,
      supplierBankIfsc: process.env.HOUZNEXT_BANK_IFSC || null,
      supplierUpiId: process.env.HOUZNEXT_UPI || null,
    };
    if (!branchId) return defaults;
    const branch = await this.branchRepo.findOne({ where: { id: branchId } });
    if (!branch) return defaults;
    return {
      ...defaults,
      supplierName: branch.name || defaults.supplierName,
      supplierGstin: branch.ownerGstNumber || defaults.supplierGstin,
      supplierAddress: branch.branchAddress || defaults.supplierAddress,
      supplierPan: branch.ownerPanNumber || defaults.supplierPan,
    };
  }

  private mergeSupplier(
    snapshot: Awaited<ReturnType<InvoicesService['snapshotSupplier']>>,
    dto: Pick<
      CreateInvoiceDto,
      | 'supplier_name'
      | 'supplier_gstin'
      | 'supplier_state'
      | 'supplier_state_code'
      | 'supplier_pan'
      | 'supplier_bank_name'
      | 'supplier_bank_account'
      | 'supplier_bank_ifsc'
      | 'supplier_upi_id'
    >,
  ) {
    return {
      supplierName: dto.supplier_name?.trim() || snapshot.supplierName,
      supplierGstin: dto.supplier_gstin?.trim() || snapshot.supplierGstin,
      supplierAddress: snapshot.supplierAddress,
      supplierState: dto.supplier_state?.trim() || snapshot.supplierState,
      supplierStateCode: dto.supplier_state_code?.trim() || snapshot.supplierStateCode,
      supplierPan: dto.supplier_pan?.trim() || snapshot.supplierPan,
      supplierBankName: dto.supplier_bank_name?.trim() || snapshot.supplierBankName,
      supplierBankAccount:
        dto.supplier_bank_account?.trim() || snapshot.supplierBankAccount,
      supplierBankIfsc: dto.supplier_bank_ifsc?.trim() || snapshot.supplierBankIfsc,
      supplierUpiId: dto.supplier_upi_id?.trim() || snapshot.supplierUpiId,
    };
  }

  private applyPaymentDisplay(
    inv: InvoiceEstimator,
    dto: Pick<
      CreateInvoiceDto,
      | 'total_paid'
      | 'balance_due'
      | 'last_payment_date'
      | 'last_payment_method'
    >,
  ) {
    if (dto.total_paid != null && Number(dto.total_paid) >= 0) {
      inv.totalPaid = round2(Number(dto.total_paid));
    }
    if (dto.balance_due != null && Number(dto.balance_due) >= 0) {
      inv.balanceDue = round2(Number(dto.balance_due));
    } else if (dto.total_paid != null) {
      inv.balanceDue = round2(
        Math.max(0, Number(inv.grandTotal || 0) - Number(inv.totalPaid || 0)),
      );
    }
    if (dto.last_payment_date !== undefined) {
      inv.lastPaymentDate = dto.last_payment_date?.trim() || null;
    }
    if (dto.last_payment_method !== undefined) {
      inv.lastPaymentMethod = dto.last_payment_method?.trim() || null;
    }
  }

  private async snapshotPreparedBy(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    return {
      preparedByUserId: userId,
      preparedByName: user?.fullName || user?.email || 'Admin',
      preparedByEmail: user?.email || null,
      preparedByPhone: user?.phone ? String(user.phone) : null,
      preparedByRole: 'Interior Designer',
      authorisedSignatory: user?.fullName || null,
    };
  }

  private mapItemsToEntities(
    invoiceId: string,
    items: InvoiceItemInputDto[],
    calculated: ReturnType<typeof calculateInvoice>,
  ): InvoiceItem[] {
    return items.map((raw, idx) => {
      const calc = calculated.items[idx];
      const entity = new InvoiceItem();
      entity.invoiceId = invoiceId;
      entity.sortOrder = raw.sort_order ?? idx;
      entity.groupName = raw.group_name || 'General';
      entity.itemName = raw.item_name;
      entity.description = raw.description || null;
      entity.hsnSacCode = raw.hsn_sac_code || null;
      entity.pricingMode = raw.pricing_mode;
      entity.quantity = raw.pricing_mode === 'unit' ? Number(raw.quantity) : null;
      entity.unitLabel = raw.unit_label || (raw.pricing_mode === 'unit' ? 'nos' : null);
      entity.unitPrice = raw.pricing_mode === 'unit' ? Number(raw.unit_price) : null;
      entity.areaValue = raw.pricing_mode === 'area' ? Number(raw.area_value) : null;
      entity.areaUnit = raw.area_unit || (raw.pricing_mode === 'area' ? 'sqft' : null);
      entity.ratePerUnit = raw.pricing_mode === 'area' ? Number(raw.rate_per_unit) : null;
      entity.itemDiscountType = raw.item_discount_type || null;
      entity.itemDiscountValue = raw.item_discount_value ?? null;
      entity.grossAmount = calc.gross_amount;
      entity.itemDiscountAmount = calc.item_discount_amount;
      entity.taxableAmount = calc.taxable_amount;
      entity.gstRate = Number(raw.gst_rate ?? 0);
      entity.gstAmount = calc.gst_amount;
      entity.cgstAmount = calc.cgst_amount;
      entity.sgstAmount = calc.sgst_amount;
      entity.igstAmount = calc.igst_amount;
      entity.lineTotal = calc.line_total;
      return entity;
    });
  }

  private applyTotals(inv: InvoiceEstimator, calc: ReturnType<typeof calculateInvoice>) {
    inv.subtotal = calc.subtotal;
    inv.subTotal = calc.grand_total;
    inv.totalItemDiscount = calc.total_item_discount;
    inv.invoiceDiscountAmount = calc.invoice_discount_amount;
    inv.taxableValue = calc.taxable_value;
    inv.cgstAmount = calc.cgst_amount;
    inv.sgstAmount = calc.sgst_amount;
    inv.igstAmount = calc.igst_amount;
    inv.totalTax = calc.total_tax;
    inv.roundOff = calc.round_off;
    inv.grandTotal = calc.grand_total;
    inv.amountInWords = calc.amount_in_words;
    inv.balanceDue = round2(Number(inv.grandTotal) - Number(inv.totalPaid || 0));
  }

  private applyPaymentIntent(
    inv: InvoiceEstimator,
    dto: Pick<CreateInvoiceDto, 'payment_status' | 'amount_paid'>,
  ) {
    const grand = Number(inv.grandTotal || 0);
    const ps = dto.payment_status || 'payment_due';
    if (ps === 'paid') {
      inv.status = 'paid';
      inv.totalPaid = grand;
      inv.balanceDue = 0;
      return;
    }
    if (ps === 'partially_paid') {
      inv.status = 'partially_paid';
      inv.totalPaid = round2(Math.min(grand, Math.max(0, Number(dto.amount_paid || 0))));
      inv.balanceDue = round2(Math.max(0, grand - Number(inv.totalPaid)));
      return;
    }
    inv.totalPaid = 0;
    inv.balanceDue = grand;
    if (inv.status === 'paid' || inv.status === 'partially_paid') {
      inv.status = 'sent';
    }
  }

  private mergePreparedBy(
    snapshot: Awaited<ReturnType<InvoicesService['snapshotPreparedBy']>>,
    dto: Pick<CreateInvoiceDto, 'prepared_by_name' | 'prepared_by_role'>,
  ) {
    if (dto.prepared_by_name?.trim()) {
      snapshot.preparedByName = dto.prepared_by_name.trim();
      snapshot.authorisedSignatory = dto.prepared_by_name.trim();
    }
    if (dto.prepared_by_role?.trim()) {
      snapshot.preparedByRole = dto.prepared_by_role.trim();
    }
    return snapshot;
  }

  private validateCreateDto(dto: CreateInvoiceDto) {
    const mobile = normalizeMobile(dto.bill_to_mobile);
    if (mobile.length !== 10) {
      throw new BadRequestException('Bill-to mobile must be 10 digits');
    }
    if (dto.bill_to_gstin && !GSTIN_REGEX.test(dto.bill_to_gstin.toUpperCase())) {
      throw new BadRequestException('Invalid GSTIN');
    }
    if (dto.bill_to_state_code && !VALID_STATE_CODES.has(dto.bill_to_state_code)) {
      throw new BadRequestException('Invalid state code');
    }
    if (dto.bill_to_pincode && !/^[0-9]{6}$/.test(dto.bill_to_pincode)) {
      throw new BadRequestException('Pincode must be 6 digits');
    }
    if (!dto.items?.length) {
      throw new BadRequestException('At least one item is required');
    }
    dto.items.forEach(validateItemInput);
  }

  private buildCalculation(dto: CreateInvoiceDto, supplierStateCode: string) {
    let billStateCode = dto.bill_to_state_code || '';
    if (!billStateCode && dto.bill_to_gstin) {
      billStateCode = stateCodeFromGstin(dto.bill_to_gstin) || '';
    }
    return calculateInvoice({
      items: dto.items.map((i) => this.toLineInput(i)),
      supplier_state_code: supplierStateCode,
      bill_to_state_code: billStateCode,
      invoice_discount_type: dto.invoice_discount_type,
      invoice_discount_value: dto.invoice_discount_value,
    });
  }

  async audit(
    invoiceId: string,
    userId: string,
    action: string,
    before: unknown,
    after: unknown,
  ) {
    const log = this.auditRepo.create({
      invoiceId,
      userId,
      action,
      beforeSnapshot: before as Record<string, unknown>,
      afterSnapshot: after as Record<string, unknown>,
    });
    await this.auditRepo.save(log);
  }

  async findOne(id: string, includeInternal = true) {
    const inv = await this.invoiceRepo.findOne({
      where: { id },
      relations: ['lineItems', 'payments', 'postedBy', 'branch'],
      order: {
        lineItems: { sortOrder: 'ASC' },
        payments: { paymentDate: 'DESC' },
      },
    });
    if (!inv) throw new NotFoundException('Invoice not found');
    inv.lineItems = (inv.lineItems || []).sort((a, b) => a.sortOrder - b.sortOrder);
    if (!includeInternal) {
      inv.internalNotes = null;
    }
    return this.serialize(inv, includeInternal);
  }

  private serialize(inv: InvoiceEstimator, includeInternal: boolean) {
    const mobile = inv.billToMobile || inv.customerMobile;
    return {
      id: inv.id,
      status: inv.status,
      invoice_type: inv.invoiceType,
      linked_quotation_id: inv.linkedQuotationId,
      bill_to_name: inv.billToName,
      bill_to_gstin: inv.billToGstin,
      bill_to_address: inv.billToAddress,
      bill_to_city: inv.billToCity,
      bill_to_state: inv.billToState,
      bill_to_state_code: inv.billToStateCode,
      bill_to_pincode: inv.billToPincode,
      bill_to_mobile: mobile,
      bill_to_email: inv.billToEmail,
      ship_to_same_as_bill: inv.shipToSameAsBill,
      ship_to_name: inv.shipToName,
      ship_to_address: inv.shipToAddress,
      ship_to_city: inv.shipToCity,
      ship_to_state: inv.shipToState,
      ship_to_state_code: inv.shipToStateCode,
      ship_to_pincode: inv.shipToPincode,
      ship_to_email: inv.shipToEmail,
      supplier_name: inv.supplierName,
      supplier_gstin: inv.supplierGstin,
      supplier_address: inv.supplierAddress,
      supplier_state: inv.supplierState,
      supplier_state_code: inv.supplierStateCode,
      supplier_pan: inv.supplierPan,
      supplier_bank_name: inv.supplierBankName,
      supplier_bank_account: inv.supplierBankAccount,
      supplier_bank_ifsc: inv.supplierBankIfsc,
      supplier_upi_id: inv.supplierUpiId,
      last_payment_date: inv.lastPaymentDate,
      last_payment_method: inv.lastPaymentMethod,
      authorised_signatory: inv.authorisedSignatory,
      invoice_number: inv.invoiceNumber,
      invoice_date: inv.invoiceDate,
      invoice_due: inv.invoiceDue,
      subtotal: Number(inv.subtotal),
      total_item_discount: Number(inv.totalItemDiscount),
      invoice_discount_type: inv.invoiceDiscountType,
      invoice_discount_value: inv.invoiceDiscountValue
        ? Number(inv.invoiceDiscountValue)
        : null,
      invoice_discount_amount: Number(inv.invoiceDiscountAmount),
      taxable_value: Number(inv.taxableValue),
      cgst_amount: Number(inv.cgstAmount),
      sgst_amount: Number(inv.sgstAmount),
      igst_amount: Number(inv.igstAmount),
      total_tax: Number(inv.totalTax),
      round_off: Number(inv.roundOff),
      grand_total: Number(inv.grandTotal),
      amount_in_words: inv.amountInWords,
      total_paid: Number(inv.totalPaid),
      balance_due: Number(inv.balanceDue),
      notes: inv.notes,
      internal_notes: includeInternal ? inv.internalNotes : undefined,
      terms_and_conditions: inv.termsAndConditions || inv.invoiceTerms,
      additional_work_details: inv.additionalWorkDetails,
      prepared_by_name: inv.preparedByName,
      prepared_by_role: inv.preparedByRole,
      sent_at: inv.sentAt,
      revised_from_id: inv.revisedFromId,
      original_sent_at: inv.originalSentAt,
      original_sent_email: inv.originalSentEmail,
      cancelled_at: inv.cancelledAt,
      cancellation_reason: inv.cancellationReason,
      items: (inv.lineItems || []).map((it) => ({
        id: it.id,
        sort_order: it.sortOrder,
        group_name: it.groupName,
        item_name: it.itemName,
        description: it.description,
        hsn_sac_code: it.hsnSacCode,
        pricing_mode: it.pricingMode,
        quantity: it.quantity != null ? Number(it.quantity) : null,
        unit_label: it.unitLabel,
        unit_price: it.unitPrice != null ? Number(it.unitPrice) : null,
        area_value: it.areaValue != null ? Number(it.areaValue) : null,
        area_unit: it.areaUnit,
        rate_per_unit: it.ratePerUnit != null ? Number(it.ratePerUnit) : null,
        gross_amount: Number(it.grossAmount),
        item_discount_amount: Number(it.itemDiscountAmount),
        taxable_amount: Number(it.taxableAmount),
        gst_rate: Number(it.gstRate),
        gst_amount: Number(it.gstAmount),
        line_total: Number(it.lineTotal),
      })),
      payments: (inv.payments || []).map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        payment_date: p.paymentDate,
        payment_method: p.paymentMethod,
        reference_no: p.referenceNo,
        notes: p.notes,
      })),
      created_at: inv.createdAt,
      updated_at: inv.updatedAt,
    };
  }

  async list(filters: InvoiceListFilterDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const qb = this.invoiceRepo
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.lineItems', 'items')
      .orderBy('inv.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters.branchId) {
      qb.andWhere(
        new Brackets((q) => {
          q.where('inv.branchId = :branchId', { branchId: filters.branchId }).orWhere(
            'inv.branchId IS NULL',
          );
        }),
      );
    }
    if (filters.status && filters.status !== 'all') {
      qb.andWhere('inv.status = :status', { status: filters.status });
    }
    if (filters.invoice_type) {
      qb.andWhere('inv.invoiceType = :type', { type: filters.invoice_type });
    }
    if (filters.date_from) {
      qb.andWhere('inv.invoiceDate >= :from', { from: filters.date_from });
    }
    if (filters.date_to) {
      qb.andWhere('inv.invoiceDate <= :to', { to: filters.date_to });
    }
    if (filters.search) {
      const s = `%${filters.search}%`;
      qb.andWhere(
        new Brackets((q) => {
          q.where('inv.billToName ILIKE :s', { s })
            .orWhere('inv.invoiceNumber ILIKE :s', { s })
            .orWhere('inv.billToGstin ILIKE :s', { s })
            .orWhere('inv.customerMobile ILIKE :s', { s })
            .orWhere('inv.billToMobile ILIKE :s', { s });
        }),
      );
    }

    const [rows, total] = await qb.getManyAndCount();
    return {
      data: rows.map((r) => this.serialize(r, true)),
      total,
      page,
      limit,
    };
  }

  async stats(branchId?: string) {
    const qb = this.invoiceRepo.createQueryBuilder('inv');
    if (branchId) {
      qb.andWhere(
        new Brackets((q) => {
          q.where('inv.branchId = :branchId', { branchId }).orWhere('inv.branchId IS NULL');
        }),
      );
    }
    const rows = await qb.getMany();
    const totalBilled = rows.reduce((s, r) => s + Number(r.grandTotal || 0), 0);
    const collected = rows.reduce((s, r) => s + Number(r.totalPaid || 0), 0);
    const outstanding = rows.reduce((s, r) => s + Number(r.balanceDue || 0), 0);
    const byStatus: Record<string, number> = {};
    for (const r of rows) {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    }
    return {
      total: rows.length,
      total_billed: round2(totalBilled),
      collected: round2(collected),
      collected_pct: totalBilled > 0 ? round2((collected / totalBilled) * 100) : 0,
      outstanding: round2(outstanding),
      pending_count: rows.filter((r) =>
        ['sent', 'partially_paid', 'overdue'].includes(r.status),
      ).length,
      by_status: byStatus,
    };
  }

  async getNextInvoiceNumber(): Promise<string> {
    const rows = await this.invoiceRepo
      .createQueryBuilder('inv')
      .select('inv.invoiceNumber', 'invoiceNumber')
      .where(`inv.invoiceNumber ~* '^HZI[0-9]+$'`)
      .getRawMany<{ invoiceNumber: string }>();

    let maxSeq = 0;
    for (const row of rows) {
      const seq = parseInvoiceSeriesNumber(row.invoiceNumber);
      if (seq != null && seq > maxSeq) maxSeq = seq;
    }
    return formatInvoiceSeriesNumber(maxSeq + 1);
  }

  async create(dto: CreateInvoiceDto, actor?: RequestUser) {
    dto = this.stripComputed(dto as CreateInvoiceDto);
    const ownerId = dto.userId || actor?.id;
    if (!ownerId) {
      throw new BadRequestException('userId is required');
    }
    dto.userId = ownerId;
    this.validateCreateDto(dto);

    const admin = await this.userRepo.findOne({ where: { id: ownerId } });
    if (!admin) throw new BadRequestException('User not found');

    const supplierSnap = await this.snapshotSupplier(dto.branchId);
    const supplier = this.mergeSupplier(supplierSnap, dto);
    const prepared = this.mergePreparedBy(
      await this.snapshotPreparedBy(dto.userId),
      dto,
    );
    const calc = this.buildCalculation(dto, supplier.supplierStateCode);

    const inv = this.invoiceRepo.create({
      userId: ownerId,
      branchId: dto.branchId || actor?.activeBranchId || null,
      postedBy: admin,
      status: 'draft',
      invoiceType: dto.invoice_type || 'interiors',
      billToName: dto.bill_to_name,
      billToGstin: dto.bill_to_gstin?.toUpperCase() || null,
      billToAddress: dto.bill_to_address || null,
      billToCity: dto.bill_to_city || null,
      billToState: dto.bill_to_state || null,
      billToStateCode: dto.bill_to_state_code || null,
      billToPincode: dto.bill_to_pincode || null,
      billToMobile: normalizeMobile(dto.bill_to_mobile),
      customerMobile: normalizeMobile(dto.bill_to_mobile),
      billToEmail: dto.bill_to_email || null,
      shipToSameAsBill: dto.ship_to_same_as_bill !== false,
      shipToName: dto.ship_to_name || null,
      shipToAddress: dto.ship_to_address || null,
      shipToCity: dto.ship_to_city || null,
      shipToState: dto.ship_to_state || null,
      shipToStateCode: dto.ship_to_state_code || null,
      shipToPincode: dto.ship_to_pincode || null,
      shipToEmail: dto.ship_to_email || null,
      invoiceNumber: await this.getNextInvoiceNumber(),
      invoiceDate: dto.invoice_date,
      invoiceDue: dto.invoice_due,
      invoiceTerms: dto.terms_and_conditions || null,
      termsAndConditions: dto.terms_and_conditions || null,
      notes: dto.notes || null,
      internalNotes: dto.internal_notes || null,
      additionalWorkDetails: dto.additional_work_details || null,
      invoiceDiscountType: dto.invoice_discount_type || null,
      invoiceDiscountValue: dto.invoice_discount_value ?? null,
      totalPaid: 0,
      createdBy: actor?.id || ownerId,
      lastEditedBy: actor?.id || ownerId,
      ...supplier,
      ...prepared,
    });
    this.applyTotals(inv, calc);
    this.applyPaymentIntent(inv, dto);
    this.applyPaymentDisplay(inv, dto);

    const saved = await this.invoiceRepo.save(inv);
    const lineEntities = this.mapItemsToEntities(saved.id, dto.items, calc);
    await this.itemRepo.save(lineEntities);

    await this.audit(saved.id, actor?.id || ownerId, 'created', null, {
      invoice_number: saved.invoiceNumber,
    });

    try {
      const full = await this.findOne(saved.id);
      await this.mailerService.notifyAdminsInvoiceEvent({
        action: 'created',
        id: saved.id,
        invoiceNumber: full.invoice_number,
        billToName: full.bill_to_name,
        billToEmail: full.bill_to_email,
        billToMobile: full.bill_to_mobile,
        status: full.status,
        grandTotal: full.grand_total,
        actorName: admin.fullName || admin.username || admin.email,
      });
    } catch (e) {
      console.error(
        'Invoice create: admin email failed (record saved):',
        e instanceof Error ? e.message : e,
      );
    }

    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateInvoiceDto, actor?: RequestUser) {
    dto = this.stripComputed(dto as UpdateInvoiceDto);
    const inv = await this.invoiceRepo.findOne({
      where: { id },
      relations: ['lineItems'],
    });
    if (!inv) throw new NotFoundException('Invoice not found');
    if (inv.status !== 'draft' && inv.status !== 'revised') {
      throw new ForbiddenException('Only draft or revised invoices can be edited');
    }

    this.validateCreateDto(dto);
    const before = this.serialize(inv, true);
    const supplierSnap = await this.snapshotSupplier(dto.branchId || inv.branchId);
    const supplier = this.mergeSupplier(supplierSnap, dto);
    const calc = this.buildCalculation(dto, supplier.supplierStateCode);
    const prepared = this.mergePreparedBy(
      await this.snapshotPreparedBy(dto.userId || inv.userId),
      dto,
    );

    Object.assign(inv, {
      billToName: dto.bill_to_name,
      billToGstin: dto.bill_to_gstin?.toUpperCase() || null,
      billToAddress: dto.bill_to_address || null,
      billToCity: dto.bill_to_city || null,
      billToState: dto.bill_to_state || null,
      billToStateCode: dto.bill_to_state_code || null,
      billToPincode: dto.bill_to_pincode || null,
      billToMobile: normalizeMobile(dto.bill_to_mobile),
      customerMobile: normalizeMobile(dto.bill_to_mobile),
      billToEmail: dto.bill_to_email || null,
      shipToSameAsBill: dto.ship_to_same_as_bill !== false,
      shipToName: dto.ship_to_name || null,
      shipToAddress: dto.ship_to_address || null,
      shipToCity: dto.ship_to_city || null,
      shipToState: dto.ship_to_state || null,
      shipToStateCode: dto.ship_to_state_code || null,
      shipToPincode: dto.ship_to_pincode || null,
      shipToEmail: dto.ship_to_email || null,
      invoiceNumber: dto.invoice_number,
      invoiceDate: dto.invoice_date,
      invoiceDue: dto.invoice_due,
      invoiceType: dto.invoice_type || inv.invoiceType,
      notes: dto.notes || null,
      internalNotes: dto.internal_notes || null,
      termsAndConditions: dto.terms_and_conditions || null,
      invoiceTerms: dto.terms_and_conditions || null,
      additionalWorkDetails: dto.additional_work_details || null,
      invoiceDiscountType: dto.invoice_discount_type || null,
      invoiceDiscountValue: dto.invoice_discount_value ?? null,
      lastEditedBy: actor?.id || dto.userId,
      branchId: dto.branchId || inv.branchId,
      preparedByName: prepared.preparedByName,
      preparedByRole: prepared.preparedByRole,
      preparedByEmail: prepared.preparedByEmail,
      preparedByPhone: prepared.preparedByPhone,
      authorisedSignatory: prepared.authorisedSignatory,
      supplierName: supplier.supplierName,
      supplierGstin: supplier.supplierGstin,
      supplierAddress: supplier.supplierAddress,
      supplierState: supplier.supplierState,
      supplierStateCode: supplier.supplierStateCode,
      supplierPan: supplier.supplierPan,
      supplierBankName: supplier.supplierBankName,
      supplierBankAccount: supplier.supplierBankAccount,
      supplierBankIfsc: supplier.supplierBankIfsc,
      supplierUpiId: supplier.supplierUpiId,
    });
    this.applyTotals(inv, calc);
    this.applyPaymentIntent(inv, dto);
    this.applyPaymentDisplay(inv, dto);
    await this.invoiceRepo.save(inv);

    await this.itemRepo.delete({ invoiceId: id });
    await this.itemRepo.save(this.mapItemsToEntities(id, dto.items, calc));

    await this.audit(id, actor?.id || dto.userId, 'edited', before, await this.findOne(id));
    const updated = await this.findOne(id);
    try {
      const actorUser = actor?.id
        ? await this.userRepo.findOne({ where: { id: actor.id } })
        : null;
      await this.mailerService.notifyAdminsInvoiceEvent({
        action: 'updated',
        id,
        invoiceNumber: updated.invoice_number,
        billToName: updated.bill_to_name,
        billToEmail: updated.bill_to_email,
        billToMobile: updated.bill_to_mobile,
        status: updated.status,
        grandTotal: updated.grand_total,
        actorName:
          actorUser?.fullName ||
          actorUser?.username ||
          actorUser?.email ||
          actor?.email,
      });
    } catch (e) {
      console.error(
        'Invoice update: admin email failed (record saved):',
        e instanceof Error ? e.message : e,
      );
    }
    return updated;
  }

  async updateStatusFromPayments(invoiceId: string) {
    const inv = await this.invoiceRepo.findOne({ where: { id: invoiceId } });
    if (!inv) return;
    const payments = await this.paymentRepo.find({ where: { invoiceId } });
    const totalPaid = round2(payments.reduce((s, p) => s + Number(p.amount), 0));
    const balanceDue = round2(Number(inv.grandTotal) - totalPaid);

    let status: InvoiceStatus = inv.status;
    if (status === 'draft' || status === 'revised' || status === 'cancelled') {
      // no auto change
    } else if (totalPaid >= Number(inv.grandTotal)) {
      status = 'paid';
    } else if (totalPaid > 0) {
      status = 'partially_paid';
    } else if (
      totalPaid === 0 &&
      inv.invoiceDue &&
      new Date(inv.invoiceDue) < new Date()
    ) {
      status = 'overdue';
    } else if (inv.sentAt) {
      status = 'sent';
    }

    await this.invoiceRepo.update(invoiceId, {
      totalPaid,
      balanceDue,
      status,
      fullyPaidAt:
        totalPaid >= Number(inv.grandTotal) ? new Date() : null,
    });
  }

  async send(id: string, dto: SendInvoiceDto, actor?: RequestUser) {
    const inv = await this.invoiceRepo.findOne({ where: { id } });
    if (!inv) throw new NotFoundException('Invoice not found');
    if (inv.status !== 'draft' && inv.status !== 'revised') {
      throw new BadRequestException('Only draft or revised invoices can be sent');
    }

    const email = dto.customer_email?.trim();
    if (!email) {
      throw new BadRequestException('Customer email is required');
    }

    const beforeStatus = inv.status;
    const beforeSentAt = inv.sentAt;
    const beforeEmail = inv.billToEmail;

    try {
      inv.billToEmail = email;
      inv.status = 'sent';
      inv.sentAt = new Date();
      await this.invoiceRepo.save(inv);
      await this.updateStatusFromPayments(id);

      const full = await this.findOne(id, true);
      const pdfBuf = await this.pdfService.generate(full);
      const invoiceNumber = String(full.invoice_number || id);
      const subject =
        dto.email_subject?.trim() ||
        `Tax Invoice ${invoiceNumber} — Houznext Interiors`;
      const pdfFilename = `${invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

      await this.mailerService.sendInvoiceToCustomer({
        to: email,
        subject,
        bodyText: dto.email_body.trim(),
        pdfBuffer: pdfBuf,
        pdfFilename,
      });

      let whatsappSent = false;
      let whatsappError: string | undefined;
      if (dto.send_whatsapp) {
        const phone = normalizeMobile(String(full.bill_to_mobile || ''));
        if (phone.length !== 10) {
          whatsappError = 'Valid 10-digit Bill To mobile is required for WhatsApp';
        } else if (!this.whatsAppService.isConfigured()) {
          whatsappError =
            'WhatsApp API is not configured on the server (ULTRAMSG_INSTANCE_ID / ULTRAMSG_TOKEN).';
        } else {
          try {
            const waTo = `91${phone}`;
            const shortBody = `Your tax invoice ${invoiceNumber} from Houznext Interiors is ready.`;
            await this.whatsAppService.sendMessage(waTo, shortBody);

            let pdfUrl: string | undefined;
            if (process.env.S3_BUCKET_NAME) {
              const key = `invoices/whatsapp/${id}/${pdfFilename}`;
              const { publicUrl } = await this.s3Service.uploadObject(
                key,
                pdfBuf,
                'application/pdf',
              );
              pdfUrl = await this.s3Service.generateSignedReadURL(publicUrl, 86400);
            } else {
              const apiBase =
                process.env.PUBLIC_API_URL ||
                process.env.API_PUBLIC_URL ||
                process.env.BACKEND_PUBLIC_URL ||
                '';
              if (apiBase) {
                pdfUrl = `${apiBase.replace(/\/$/, '')}/invoices/public/${id}/pdf?mobile=${phone}`;
              }
            }

            if (pdfUrl) {
              await this.whatsAppService.sendPdf(waTo, pdfUrl, pdfFilename);
            } else {
              const extra = dto.email_body.trim().slice(0, 500);
              await this.whatsAppService.sendMessage(
                waTo,
                extra
                  ? `${shortBody}\n\n${extra}`
                  : `${shortBody}\n\nContact Houznext for your invoice PDF copy.`,
              );
            }
            whatsappSent = true;
          } catch (err) {
            whatsappError =
              err instanceof Error ? err.message : 'WhatsApp send failed';
          }
        }
      }

      await this.audit(id, actor?.id || inv.userId, 'sent', { status: beforeStatus }, {
        status: 'sent',
        customer_email: email,
        send_whatsapp: Boolean(dto.send_whatsapp),
        whatsapp_sent: whatsappSent,
      });

      const result = await this.findOne(id);
      return {
        ...result,
        email_sent: true,
        whatsapp_sent: whatsappSent,
        whatsapp_error: whatsappError,
      };
    } catch (err) {
      inv.status = beforeStatus;
      inv.sentAt = beforeSentAt;
      inv.billToEmail = beforeEmail;
      await this.invoiceRepo.save(inv);
      throw err;
    }
  }

  async reopen(id: string, actor?: RequestUser) {
    const inv = await this.invoiceRepo.findOne({ where: { id } });
    if (!inv) throw new NotFoundException('Invoice not found');
    const before = inv.status;
    inv.status = 'draft';
    await this.invoiceRepo.save(inv);
    await this.audit(id, actor?.id || inv.userId, 'reopened', { status: before }, { status: 'draft' });
    return this.findOne(id);
  }

  async cancel(id: string, dto: CancelInvoiceDto, actor?: RequestUser) {
    const inv = await this.invoiceRepo.findOne({ where: { id } });
    if (!inv) throw new NotFoundException('Invoice not found');
    inv.status = 'cancelled';
    inv.cancellationReason = dto.reason;
    inv.cancelledAt = new Date();
    await this.invoiceRepo.save(inv);
    await this.audit(id, actor?.id || inv.userId, 'cancelled', null, { reason: dto.reason });
    return this.findOne(id);
  }

  /**
   * Create a revised copy of a sent invoice. Original stays `sent`;
   * the new invoice is `revised` and editable.
   */
  async revise(id: string, actor?: RequestUser) {
    const sourceInv = await this.invoiceRepo.findOne({
      where: { id },
      relations: ['lineItems'],
    });
    if (!sourceInv) throw new NotFoundException('Invoice not found');
    if (sourceInv.status !== 'sent') {
      throw new BadRequestException('Only sent invoices can be revised');
    }

    const source = await this.findOne(id, true);
    const ownerId = actor?.id || sourceInv.userId;
    const dto: CreateInvoiceDto = {
      userId: ownerId,
      branchId: sourceInv.branchId || undefined,
      bill_to_name: source.bill_to_name,
      bill_to_gstin: source.bill_to_gstin || undefined,
      bill_to_address: source.bill_to_address || undefined,
      bill_to_city: source.bill_to_city || undefined,
      bill_to_state: source.bill_to_state || undefined,
      bill_to_state_code: source.bill_to_state_code || undefined,
      bill_to_pincode: source.bill_to_pincode || undefined,
      bill_to_mobile: source.bill_to_mobile || undefined,
      bill_to_email: source.bill_to_email || undefined,
      ship_to_same_as_bill: source.ship_to_same_as_bill,
      ship_to_name: source.ship_to_name || undefined,
      ship_to_address: source.ship_to_address || undefined,
      ship_to_city: source.ship_to_city || undefined,
      ship_to_state: source.ship_to_state || undefined,
      ship_to_state_code: source.ship_to_state_code || undefined,
      ship_to_pincode: source.ship_to_pincode || undefined,
      ship_to_email: source.ship_to_email || undefined,
      invoice_type: source.invoice_type,
      invoice_date: new Date().toISOString().slice(0, 10),
      invoice_due: source.invoice_due,
      invoice_discount_type: source.invoice_discount_type || undefined,
      invoice_discount_value: source.invoice_discount_value ?? undefined,
      notes: source.notes || undefined,
      internal_notes: source.internal_notes || undefined,
      terms_and_conditions: source.terms_and_conditions || undefined,
      additional_work_details: source.additional_work_details || undefined,
      prepared_by_name: source.prepared_by_name || undefined,
      prepared_by_role: source.prepared_by_role || undefined,
      items: (source.items || []).map((it: any) => ({
        item_name: it.item_name,
        group_name: it.group_name,
        description: it.description,
        hsn_sac_code: it.hsn_sac_code,
        pricing_mode: it.pricing_mode,
        quantity: it.quantity,
        unit_label: it.unit_label,
        unit_price: it.unit_price,
        area_value: it.area_value,
        area_unit: it.area_unit,
        rate_per_unit: it.rate_per_unit,
        item_discount_type: it.item_discount_type,
        item_discount_value: it.item_discount_value,
        gst_rate: it.gst_rate,
      })),
    };

    const created = await this.create(dto, actor);
    await this.invoiceRepo.update(created.id, {
      status: 'revised',
      revisedFromId: id,
      originalSentAt: sourceInv.sentAt,
      originalSentEmail: sourceInv.billToEmail,
    });

    await this.audit(created.id, ownerId, 'revised', null, {
      revised_from_id: id,
      original_invoice_number: source.invoice_number,
    });

    return this.findOne(created.id);
  }

  async duplicate(id: string, actor?: RequestUser) {
    const source = await this.findOne(id);
    const { id: _id, payments, created_at, updated_at, sent_at, ...rest } = source as any;
    const dto: CreateInvoiceDto = {
      userId: actor?.id || source.id,
      bill_to_name: rest.bill_to_name,
      bill_to_gstin: rest.bill_to_gstin,
      bill_to_address: rest.bill_to_address,
      bill_to_city: rest.bill_to_city,
      bill_to_state: rest.bill_to_state,
      bill_to_state_code: rest.bill_to_state_code,
      bill_to_pincode: rest.bill_to_pincode,
      bill_to_mobile: rest.bill_to_mobile,
      bill_to_email: rest.bill_to_email,
      ship_to_same_as_bill: rest.ship_to_same_as_bill,
      ship_to_name: rest.ship_to_name,
      ship_to_address: rest.ship_to_address,
      ship_to_city: rest.ship_to_city,
      ship_to_state: rest.ship_to_state,
      ship_to_state_code: rest.ship_to_state_code,
      ship_to_pincode: rest.ship_to_pincode,
      ship_to_email: rest.ship_to_email,
      invoice_date: new Date().toISOString().slice(0, 10),
      invoice_due: rest.invoice_due,
      invoice_discount_type: rest.invoice_discount_type,
      invoice_discount_value: rest.invoice_discount_value,
      notes: rest.notes,
      internal_notes: rest.internal_notes,
      terms_and_conditions: rest.terms_and_conditions,
      additional_work_details: rest.additional_work_details,
      items: rest.items.map((it: any) => ({
        item_name: it.item_name,
        group_name: it.group_name,
        description: it.description,
        hsn_sac_code: it.hsn_sac_code,
        pricing_mode: it.pricing_mode,
        quantity: it.quantity,
        unit_label: it.unit_label,
        unit_price: it.unit_price,
        area_value: it.area_value,
        area_unit: it.area_unit,
        rate_per_unit: it.rate_per_unit,
        item_discount_type: it.item_discount_type,
        item_discount_value: it.item_discount_value,
        gst_rate: it.gst_rate,
      })),
    };
    return this.create(dto, actor);
  }

  async addPayment(id: string, dto: RecordPaymentDto, actor?: RequestUser) {
    const inv = await this.invoiceRepo.findOne({ where: { id } });
    if (!inv) throw new NotFoundException('Invoice not found');
    if (inv.status === 'draft' || inv.status === 'revised' || inv.status === 'cancelled') {
      throw new BadRequestException('Cannot record payment on draft/revised/cancelled invoice');
    }
    const amount = round2(Number(dto.amount));
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Enter a valid payment amount');
    }
    const balanceDue = round2(
      Number.isFinite(Number(inv.balanceDue))
        ? Number(inv.balanceDue)
        : Number(inv.grandTotal || 0) - Number(inv.totalPaid || 0),
    );
    if (amount > balanceDue + 0.01) {
      throw new BadRequestException('Payment exceeds balance due');
    }
    const payment = this.paymentRepo.create({
      invoiceId: id,
      amount,
      paymentDate: dto.payment_date,
      paymentMethod: dto.payment_method as InvoicePayment['paymentMethod'],
      referenceNo: dto.reference_no || null,
      notes: dto.notes || null,
      recordedBy: actor?.id || inv.userId,
    });
    await this.paymentRepo.save(payment);
    await this.updateStatusFromPayments(id);
    await this.audit(id, actor?.id || inv.userId, 'payment_added', null, {
      ...dto,
      amount,
    });
    return this.findOne(id);
  }

  async updatePayment(
    invoiceId: string,
    paymentId: string,
    dto: RecordPaymentDto,
    actor?: RequestUser,
  ) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId, invoiceId },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    const before = { ...payment };
    Object.assign(payment, {
      amount: dto.amount,
      paymentDate: dto.payment_date,
      paymentMethod: dto.payment_method,
      referenceNo: dto.reference_no || null,
      notes: dto.notes || null,
    });
    await this.paymentRepo.save(payment);
    await this.updateStatusFromPayments(invoiceId);
    await this.audit(invoiceId, actor?.id || payment.recordedBy, 'payment_edited', before, payment);
    return this.findOne(invoiceId);
  }

  async deletePayment(invoiceId: string, paymentId: string, actor?: RequestUser) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId, invoiceId },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    await this.paymentRepo.remove(payment);
    await this.updateStatusFromPayments(invoiceId);
    await this.audit(invoiceId, actor?.id || payment.recordedBy, 'payment_deleted', payment, null);
    return this.findOne(invoiceId);
  }

  async delete(id: string, actor?: RequestUser): Promise<void> {
    const inv = await this.invoiceRepo.findOne({ where: { id } });
    if (!inv) throw new NotFoundException('Invoice not found');

    const token = randomBytes(24).toString('hex');
    await this.invoiceRepo.update(id, {
      restoreToken: token,
      deletedById: actor?.id || null,
    });
    await this.invoiceRepo.softDelete(id);

    const actorUser = actor?.id
      ? await this.userRepo.findOne({ where: { id: actor.id } })
      : null;
    const restoreUrl = this.mailerService.buildInvoiceRestoreUrl(id, token);

    try {
      await this.mailerService.notifyAdminsInvoiceEvent({
        action: 'deleted',
        id,
        invoiceNumber: inv.invoiceNumber,
        billToName: inv.billToName,
        billToEmail: inv.billToEmail,
        billToMobile: inv.billToMobile || inv.customerMobile,
        status: inv.status,
        grandTotal: Number(inv.grandTotal),
        actorName:
          actorUser?.fullName ||
          actorUser?.username ||
          actorUser?.email ||
          actor?.email,
        restoreUrl,
      });
    } catch (e) {
      console.error(
        'Invoice delete: admin email failed (record soft-deleted):',
        e instanceof Error ? e.message : e,
      );
    }

    await this.audit(id, actor?.id || inv.userId, 'deleted', { status: inv.status }, {
      soft_deleted: true,
    });
  }

  async restoreWithToken(id: string, token: string): Promise<InvoiceEstimator> {
    if (!token?.trim()) {
      throw new BadRequestException('Restore token is required');
    }
    const inv = await this.invoiceRepo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!inv || !inv.deletedAt) {
      throw new NotFoundException('Deleted invoice not found');
    }
    if (!inv.restoreToken || inv.restoreToken !== token.trim()) {
      throw new ForbiddenException('Invalid restore token');
    }
    await this.invoiceRepo.restore(id);
    await this.invoiceRepo.update(id, {
      restoreToken: null,
      deletedById: null,
    });
    await this.audit(id, inv.userId, 'restored', null, { restored: true });
    const restored = await this.invoiceRepo.findOne({ where: { id } });
    if (!restored) throw new NotFoundException('Invoice not found after restore');
    return restored;
  }

  async findByMobile(mobile: string) {
    const suffix = mobileSuffix10(mobile);
    if (suffix.length !== 10) return [];
    const rows = await this.invoiceRepo
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.lineItems', 'items')
      .leftJoinAndSelect('inv.payments', 'payments')
      .where(
        new Brackets((q) => {
          q.where(sqlMobileSuffixMatch('inv.customerMobile'), { mobileSuffix: suffix })
            .orWhere(sqlMobileSuffixMatch('inv.billToMobile'), { mobileSuffix: suffix });
        }),
      )
      .orderBy('inv.invoiceDate', 'DESC')
      .getMany();
    return rows.map((r) => this.serialize(r, false));
  }

  async getAuditLog(invoiceId: string) {
    return this.auditRepo.find({
      where: { invoiceId },
      order: { createdAt: 'DESC' },
    });
  }

  async generatePdf(id: string): Promise<Buffer> {
    const inv = await this.findOne(id, true);
    return this.pdfService.generate(inv);
  }

  async generatePublicPdf(id: string, mobile: string): Promise<Buffer> {
    const inv = await this.findOne(id, false);
    const suffix = mobileSuffix10(mobile);
    const invMobile = normalizeMobile(String(inv.bill_to_mobile || ''));
    if (suffix.length !== 10 || invMobile !== suffix) {
      throw new ForbiddenException('Not authorized to download this invoice');
    }
    if (inv.status === 'draft' || inv.status === 'revised') {
      throw new BadRequestException('Invoice not available');
    }
    return this.pdfService.generate(inv);
  }

  async fromQuotation(quotationId: string, actor?: RequestUser) {
    const q = await this.quotationRepo.findOne({
      where: { id: quotationId },
      relations: ['itemGroups', 'postedBy'],
    });
    if (!q) throw new NotFoundException('Quotation not found');

    const items: InvoiceItemInputDto[] = [];
    let sort = 0;
    for (const group of q.itemGroups || []) {
      for (const it of group.items || []) {
        const hasArea = Number(it.area) > 1;
        items.push({
          item_name: it.item_name,
          group_name: group.title,
          description: it.description,
          pricing_mode: hasArea ? 'area' : 'unit',
          quantity: hasArea ? undefined : Number(it.quantity) || 1,
          unit_label: 'nos',
          unit_price: hasArea ? undefined : Number(it.unit_price),
          area_value: hasArea ? Number(it.area) : undefined,
          area_unit: hasArea ? 'sqft' : undefined,
          rate_per_unit: hasArea ? Number(it.unit_price) : undefined,
          gst_rate: 18,
          sort_order: sort++,
        });
      }
    }

    const loc = q.location || ({} as CostEstimator['location']);
    const dto: CreateInvoiceDto = {
      userId: actor?.id || q.postedBy?.id,
      bill_to_name: `${q.firstname} ${q.lastname}`.trim(),
      bill_to_mobile: q.customerMobile || String(q.phone || '').slice(-10),
      bill_to_email: q.email,
      bill_to_address: loc.address_line_1 || '',
      bill_to_city: loc.city || '',
      bill_to_state: loc.state || '',
      bill_to_pincode: loc.pincode || '',
      ship_to_same_as_bill: true,
      invoice_date: new Date().toISOString().slice(0, 10),
      invoice_due: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      invoice_type: q.category?.toLowerCase().includes('furniture') ? 'furniture' : 'interiors',
      additional_work_details: q.details || undefined,
      items,
    };

    const created = await this.create(dto, actor);
    await this.invoiceRepo.update(created.id, {
      linkedQuotationId: quotationId,
    });
    return this.findOne(created.id);
  }

  @Cron('0 2 * * *')
  async markOverdueInvoices() {
    const rows = await this.invoiceRepo
      .createQueryBuilder('inv')
      .where('inv.status IN (:...statuses)', {
        statuses: ['sent', 'partially_paid'],
      })
      .andWhere('inv.invoiceDue < :today', {
        today: new Date().toISOString().slice(0, 10),
      })
      .getMany();
    for (const inv of rows) {
      await this.invoiceRepo.update(inv.id, { status: 'overdue' });
    }
  }
}
