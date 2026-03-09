import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import {
  OrderItemType,
  OrderStatusEnum,
  OrderType,
  isStoreItemType,
} from './enum/order.enum';
import { Cart } from 'src/cart/entities/cart.entity';
import { CartItem } from 'src/cartItems/entities/cartitem.entity';
import { FurnitureVariant } from 'src/furnitures/entities/furniture-variant.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { BranchCategory } from 'src/branch/enum/branch.enum';
import {
  CancelOrderDto,
  CreateOrderDto,
  CreateOrderFromCartDto,
  ProcessReturnDto,
  RequestReturnDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
} from './dto/orders.dto';
import { FilterOrdersDto } from './dto/order-filter.dto';

type RequestUser = {
  id: string;
  userKind?: any[];
  branchMembership?: {
    branchId: string;
    branchRoles?: { id: string; roleName: string }[];
    isBranchHead?: boolean;
  };
};

type InventoryItemInput = {
  productType: OrderItemType;
  productId: string;
  quantity: number;
  name?: string;
};

/** Product types for which Cash on Delivery is not allowed (online payment only). */
const PRODUCT_TYPES_NO_COD: string[] = [
  OrderItemType.SOLAR_PACKAGE,
  OrderItemType.LEGAL_PACKAGE,
  OrderItemType.PROPERTY_PREMIUM_PLAN,
];

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,

    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,

    @InjectRepository(FurnitureVariant)
    private readonly furnitureVariantRepo: Repository<FurnitureVariant>,

    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  private isAdmin(user: RequestUser) {
    if (user?.userKind?.includes('ADMIN') || user?.userKind?.includes('STAFF'))
      return true;
    const roleNames =
      user?.branchMembership?.branchRoles?.map((r) => r.roleName) ?? [];
    const isSuperAdmin =
      roleNames.includes('SuperAdmin') || roleNames.includes('SUPER_ADMIN');
    const isBranchHead = user?.branchMembership?.isBranchHead ?? false;
    return isSuperAdmin || isBranchHead;
  }
  private assertAdmin(user: RequestUser) {
    if (!this.isAdmin(user)) throw new ForbiddenException('No permission');
  }

  private static readonly ORDER_TYPE_TO_BRANCH_CATEGORY: Partial<
    Record<OrderType, BranchCategory>
  > = {
    [OrderType.SOLAR]: BranchCategory.SOLAR,
    [OrderType.LEGAL]: BranchCategory.LEGAL,
    [OrderType.ELECTRONICS]: BranchCategory.ELECTRONICS,
    [OrderType.FURNITURE]: BranchCategory.FURNITURE,
    [OrderType.HOME_DECOR]: BranchCategory.HOME_DECOR,
    [OrderType.INTERIORS]: BranchCategory.INTERIORS,
    [OrderType.CUSTOM_BUILDER]: BranchCategory.CUSTOM_BUILDER,
  };

  private async resolveBranchForOrderType(
    orderType: OrderType,
    explicitBranchId?: string | null,
  ): Promise<string | null> {
    if (explicitBranchId) return explicitBranchId;

    const category =
      OrdersService.ORDER_TYPE_TO_BRANCH_CATEGORY[orderType];
    if (!category) return null;

    const branch = await this.branchRepo.findOne({
      where: { category, isActive: true },
      order: { createdAt: 'ASC' },
      select: ['id'],
    });

    return branch?.id ?? null;
  }

  private emitStatusChanged(
    order: Order,
    newStatus: OrderStatusEnum,
    oldStatus: OrderStatusEnum,
    updatedBy: string,
  ) {
    this.eventEmitter.emit('order.statusChanged', {
      orderId: order.id,
      orderNo: order.orderNo,
      orderType: order.type,
      userId: order.user?.id,
      newStatus,
      oldStatus,
      branchId: order.branch?.id,
      updatedBy,
      courierName: (order.shippingDetails as any)?.courierName,
      trackingId: (order.shippingDetails as any)?.trackingId,
      customerEmail: order.user?.email,
      customerPhone: order.user?.phone,
      timestamp: new Date().toISOString(),
    });
  }

  /** Derive order type from cart/order item types (single type → that type, mixed → MIXED). */
  private deriveOrderTypeFromItemTypes(itemTypes: OrderItemType[]): OrderType {
    const set = new Set(itemTypes);
    if (set.size === 0) return OrderType.STORE;
    if (set.size > 1) return OrderType.MIXED;
    const single = itemTypes[0];
    if (isStoreItemType(single)) {
      if (single === OrderItemType.FURNITURE_PRODUCT) return OrderType.FURNITURE;
      if (single === OrderItemType.ELECTRONICS_PRODUCT) return OrderType.ELECTRONICS;
      if (single === OrderItemType.HOME_DECOR_PRODUCT) return OrderType.HOME_DECOR;
      return OrderType.STORE;
    }
    if (single === OrderItemType.PROPERTY_PREMIUM_PLAN) return OrderType.PROPERTY_PREMIUM;
    if (single === OrderItemType.PROPERTY_BOOKING_TOKEN) return OrderType.PROPERTY_BOOKING;
    if (single === OrderItemType.LEGAL_PACKAGE) return OrderType.LEGAL;
    if (single === OrderItemType.INTERIOR_PACKAGE) return OrderType.INTERIORS;
    if (single === OrderItemType.CUSTOM_BUILDER_PACKAGE) return OrderType.CUSTOM_BUILDER;
    if (single === OrderItemType.SOLAR_PACKAGE) return OrderType.SOLAR;
    return OrderType.SERVICE;
  }

  // ---------------- ORDER NO ----------------

  private async generateOrderNo(): Promise<string> {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `OC-${year}-${Date.now()}-${rand}`;
  }

  // ---------------- STATUS HISTORY ----------------

  private pushHistory(
    order: Order,
    status: any,
    byUserId: string,
    note?: string,
  ) {
    order.statusHistory = [
      ...(order.statusHistory ?? []),
      {
        status,
        at: new Date().toISOString(),
        byUserId,
        note,
      },
    ];
  }

  // ---------------- INVENTORY ----------------

  private async reserveInventoryForItems(items: InventoryItemInput[]) {
    for (const item of items) {
      switch (item.productType) {
        case OrderItemType.FURNITURE_PRODUCT: {
          const variant = await this.furnitureVariantRepo.findOne({
            where: { id: item.productId, isActive: true },
          });
          if (!variant) {
            throw new BadRequestException(
              `Furniture variant ${item.productId} not found or inactive`,
            );
          }

          const available = variant.stockQty - variant.reservedQty;
          if (available < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for ${item.name || 'item'}. Only ${available} left.`,
            );
          }

          variant.reservedQty += item.quantity;
          await this.furnitureVariantRepo.save(variant);
          break;
        }

        case OrderItemType.ELECTRONICS_PRODUCT:
          // TODO: implement electronics inventory later
          break;

        default:
          break;
      }
    }
  }

  private async releaseInventoryForOrder(orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
    if (!order) return;

    for (const item of order.items) {
      switch (item.productType) {
        case OrderItemType.FURNITURE_PRODUCT: {
          const variant = await this.furnitureVariantRepo.findOne({
            where: { id: item.productId },
          });
          if (!variant) break;

          variant.reservedQty = Math.max(
            0,
            variant.reservedQty - item.quantity,
          );
          await this.furnitureVariantRepo.save(variant);
          break;
        }
        default:
          break;
      }
    }
  }

  // ---------------- TOTALS ----------------

  private computeTotals(dto: {
    items: Array<{
      quantity: number;
      mrp: number;
      sellingPrice: number;
      taxPercent?: number;
    }>;
    couponDiscount?: number;
    shippingTotal?: number;
    feeTotal?: number;
  }) {
    const couponDiscount = Number(dto.couponDiscount ?? 0);
    const shippingTotal = Number(dto.shippingTotal ?? 0);
    const feeTotal = Number(dto.feeTotal ?? 0);

    const subTotalNum = dto.items.reduce(
      (sum, it) => sum + Number(it.sellingPrice) * Number(it.quantity),
      0,
    );

    const taxTotalNum = dto.items.reduce((sum, it) => {
      const line = Number(it.sellingPrice) * Number(it.quantity);
      const taxPercent = Number(it.taxPercent ?? 0);
      return sum + (line * taxPercent) / 100;
    }, 0);

    const discountTotalNum =
      dto.items.reduce((sum, it) => {
        const unitDiscount = Math.max(
          Number(it.mrp) - Number(it.sellingPrice),
          0,
        );
        return sum + unitDiscount * Number(it.quantity);
      }, 0) + couponDiscount;

    const grandTotalNum =
      subTotalNum + taxTotalNum + shippingTotal + feeTotal - couponDiscount;

    const grand = Math.max(grandTotalNum, 0);

    return {
      subTotal: subTotalNum.toFixed(2),
      taxTotal: taxTotalNum.toFixed(2),
      discountTotal: discountTotalNum.toFixed(2),
      couponDiscount: couponDiscount.toFixed(2),
      shippingTotal: shippingTotal.toFixed(2),
      feeTotal: feeTotal.toFixed(2),
      grandTotal: grand.toFixed(2),
    };
  }

  // =========================
  // CREATE ORDER (DIRECT)
  // =========================

  async createOrder(dto: CreateOrderDto, userId: string, actor: RequestUser) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least 1 item');
    }

    await this.reserveInventoryForItems(
      dto.items.map((i) => ({
        productType: i.productType,
        productId: i.productId,
        quantity: i.quantity,
        name: i.name,
      })),
    );

    const totals = this.computeTotals({
      items: dto.items.map((i) => ({
        mrp: i.mrp,
        sellingPrice: i.sellingPrice,
        taxPercent: i.taxPercent ?? 0,
        quantity: i.quantity,
      })),
      couponDiscount: dto.couponDiscount ?? 0,
      shippingTotal: dto.shippingTotal ?? 0,
      feeTotal: dto.feeTotal ?? 0,
    });

    const resolvedBranchId = await this.resolveBranchForOrderType(
      dto.type,
      dto.branchId,
    );

    const order = this.orderRepo.create({
      orderNo: await this.generateOrderNo(),
      type: dto.type,
      currency: dto.currency ?? 'INR',
      status: OrderStatusEnum.CREATED,
      user: { id: userId } as any,
      createdByUser: actor?.id ? ({ id: actor.id } as any) : null,
      branch: resolvedBranchId ? ({ id: resolvedBranchId } as any) : null,
      couponCode: dto.couponCode ?? null,
      couponDiscount: totals.couponDiscount,
      subTotal: totals.subTotal,
      discountTotal: totals.discountTotal,
      taxTotal: totals.taxTotal,
      shippingTotal: totals.shippingTotal,
      feeTotal: totals.feeTotal,
      grandTotal: totals.grandTotal,
      amountPaid: '0.00',
      amountDue: totals.grandTotal,
      meta: dto.meta ?? {},
    });

    this.pushHistory(order, OrderStatusEnum.CREATED, actor.id);

    const savedOrder = await this.orderRepo.save(order);

    const items = dto.items.map((i) => {
      const unitDiscount = Math.max(i.mrp - i.sellingPrice, 0);
      const itemSubTotal = i.sellingPrice * i.quantity;
      const taxAmount = (itemSubTotal * (i.taxPercent ?? 0)) / 100;
      const discountAmount = unitDiscount * i.quantity;
      const itemTotal = itemSubTotal + taxAmount;

      return this.orderItemRepo.create({
        order: savedOrder,
        productType: i.productType,
        productId: i.productId,
        name: i.name,
        description: i.description,
        mrp: i.mrp.toFixed(2),
        sellingPrice: i.sellingPrice.toFixed(2),
        unitDiscount: unitDiscount.toFixed(2),
        quantity: i.quantity,
        itemSubTotal: itemSubTotal.toFixed(2),
        taxPercent: (i.taxPercent ?? 0).toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        itemTotal: itemTotal.toFixed(2),
        meta: i.meta ?? {},
      });
    });

    await this.orderItemRepo.save(items);

    const fullOrder = await this.getOrderById(savedOrder.id, actor);
    this.emitStatusChanged(savedOrder, OrderStatusEnum.CREATED, OrderStatusEnum.CREATED, actor.id);
    return fullOrder;
  }

  // =========================
  // CREATE ORDER FROM CART (unified flow: store + services + property premium + legal + solar etc.)
  // =========================

  async createOrderFromCart(
    userId: string,
    actor: RequestUser,
    dto?: CreateOrderFromCartDto,
  ) {
    const cart = await this.cartRepo.findOne({
      where: { userId },
      relations: ['items'],
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const itemTypes = cart.items.map((ci) => ci.productType);
    const orderType = this.deriveOrderTypeFromItemTypes(itemTypes);

    const isCod = dto?.paymentMethod === 'COD';
    if (isCod) {
      const hasNoCodItem = itemTypes.some((t) => PRODUCT_TYPES_NO_COD.includes(t));
      if (hasNoCodItem) {
        throw new BadRequestException(
          'Cash on Delivery is not available for one or more items in your cart (e.g. Solar, Legal services, Property premium). Please use online payment.',
        );
      }
    }

    await this.reserveInventoryForItems(
      cart.items.map((ci) => ({
        productType: ci.productType,
        productId: ci.productId,
        quantity: ci.quantity,
        name: ci.name,
      })),
    );

    const grandTotal = cart.grandTotal ?? '0.00';

    const resolvedBranchId = await this.resolveBranchForOrderType(
      orderType,
      cart.branchId ?? null,
    );

    const order = this.orderRepo.create({
      orderNo: await this.generateOrderNo(),
      user: { id: userId } as any,
      createdByUser: actor?.id ? ({ id: actor.id } as any) : null,
      branch: resolvedBranchId ? { id: resolvedBranchId } as any : undefined,
      type: orderType,
      status: isCod ? OrderStatusEnum.CONFIRMED : OrderStatusEnum.CREATED,
      currency: cart.currency ?? 'INR',
      subTotal: cart.subTotal ?? '0.00',
      discountTotal: cart.discountTotal ?? '0.00',
      couponDiscount: cart.couponDiscount ?? '0.00',
      couponCode: cart.couponCode ?? undefined,
      taxTotal: cart.taxTotal ?? '0.00',
      shippingTotal: cart.shippingTotal ?? '0.00',
      feeTotal: cart.feeTotal ?? '0.00',
      grandTotal,
      amountPaid: isCod ? grandTotal : '0.00',
      amountDue: isCod ? '0.00' : grandTotal,
      billingDetails: cart.billingDetails ?? undefined,
      shippingDetails: cart.shippingDetails ?? undefined,
      serviceDetails: cart.serviceDetails ?? undefined,
      taxBreakup: cart.taxBreakup ?? undefined,
      meta: {
        ...(cart.meta ?? {}),
        ...(isCod ? { paymentMethod: 'COD' } : {}),
      },
    });

    this.pushHistory(
      order,
      isCod ? OrderStatusEnum.CONFIRMED : OrderStatusEnum.CREATED,
      actor?.id ?? userId,
      isCod ? 'Cash on Delivery – order confirmed' : undefined,
    );

    const savedOrder = await this.orderRepo.save(order);

    const orderItems = cart.items.map((ci) =>
      this.orderItemRepo.create({
        order: savedOrder,
        productType: ci.productType,
        productId: ci.productId,
        name: ci.name,
        description: ci.description,
        mrp: ci.mrp,
        sellingPrice: ci.sellingPrice,
        unitDiscount: ci.unitDiscount,
        quantity: ci.quantity,
        itemSubTotal: ci.itemSubTotal,
        taxPercent: ci.taxPercent,
        taxAmount: ci.taxAmount,
        discountAmount: ci.discountAmount,
        itemTotal: ci.itemTotal,
        snapshot: ci.snapshot
          ? {
              ...ci.snapshot,
              variantId: ci.variantId ?? ci.snapshot?.variantId,
            }
          : ci.variantId
            ? { variantId: ci.variantId }
            : undefined,
        meta: ci.meta ?? {},
      }),
    );

    await this.orderItemRepo.save(orderItems);

    if (isCod) {
      await this.cartItemRepo.delete({ cartId: cart.id });
    }

    if (isCod && savedOrder.shippingDetails) {
      await this.onCodOrderCreated(savedOrder).catch((err) => {
        console.error('Delivery integration (onCodOrderCreated):', err);
      });
    }

    const initialStatus = isCod ? OrderStatusEnum.CONFIRMED : OrderStatusEnum.CREATED;
    const fullOrder = await this.getOrderById(savedOrder.id, actor);
    this.emitStatusChanged(savedOrder, initialStatus, initialStatus, actor?.id ?? userId);
    return fullOrder;
  }

  /**
   * Override or inject a delivery service to create shipment for COD orders.
   * Integrate with your delivery provider API (e.g. Delhivery, Shiprocket) here.
   */
  private async onCodOrderCreated(order: Order): Promise<void> {
    // Placeholder: wire your delivery API here, e.g.:
    // await this.deliveryService.createShipment({ orderId: order.id, ... });
    void order;
  }

  // =========================
  // GET MY ORDERS (USER)
  // =========================

  async getOrdersForUser(userId: string, filter: FilterOrdersDto) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;

    const qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.items', 'items')
      .where('o.userId = :userId', { userId })
      .andWhere('o.status != :createdStatus', { createdStatus: OrderStatusEnum.CREATED });

    if (filter.status)
      qb.andWhere('o.status = :status', { status: filter.status });
    if (filter.type) qb.andWhere('o.type = :type', { type: filter.type });

    if (filter.search) {
      qb.andWhere(
        new Brackets((sq) => {
          sq.where('o.orderNo ILIKE :q', { q: `%${filter.search}%` }).orWhere(
            'items.name ILIKE :q',
            { q: `%${filter.search}%` },
          );
        }),
      );
    }

    qb.orderBy('o.createdAt', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  // =========================
  // GET ORDER BY ID (USER/ADMIN)
  // =========================

  async getOrderById(orderId: string, user: RequestUser) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items', 'user', 'branch', 'createdByUser'],
    });

    if (!order) throw new NotFoundException('Order not found');

    if (!this.isAdmin(user) && order.user?.id !== user.id) {
      throw new ForbiddenException('You cannot access this order');
    }

    return order;
  }

  // =========================
  // ADMIN LIST (FULL FILTERS)
  // =========================

  async getAllOrders(filter: FilterOrdersDto, user: RequestUser) {
    this.assertAdmin(user);

    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;

    const qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.items', 'items')
      .leftJoinAndSelect('o.user', 'user')
      .leftJoinAndSelect('o.createdByUser', 'createdByUser')
      .leftJoinAndSelect('o.branch', 'branch');

    if (filter.status)
      qb.andWhere('o.status = :status', { status: filter.status });
    if (filter.type) qb.andWhere('o.type = :type', { type: filter.type });
    if (filter.userId)
      qb.andWhere('o.userId = :userId', { userId: filter.userId });
    if (filter.branchId)
      qb.andWhere('o.branchId = :branchId', { branchId: filter.branchId });

    if (filter.productType)
      qb.andWhere('items.productType = :pt', { pt: filter.productType });
    if (filter.productId)
      qb.andWhere('items.productId = :pid', { pid: filter.productId });

    // Date preset (last 7/30/90 days) overrides or complements dateFrom/dateTo
    let dateFrom = filter.dateFrom;
    let dateTo = filter.dateTo;
    if (filter.datePreset) {
      const now = new Date();
      dateTo = now.toISOString().slice(0, 10);
      const d = new Date(now);
      if (filter.datePreset === 'last7days') d.setDate(d.getDate() - 7);
      else if (filter.datePreset === 'last30days') d.setDate(d.getDate() - 30);
      else if (filter.datePreset === 'last90days') d.setDate(d.getDate() - 90);
      dateFrom = d.toISOString().slice(0, 10);
    }
    if (dateFrom)
      qb.andWhere('o.createdAt >= :df', {
        df: new Date(`${dateFrom}T00:00:00.000Z`),
      });
    if (dateTo)
      qb.andWhere('o.createdAt <= :dt', {
        dt: new Date(`${dateTo}T23:59:59.999Z`),
      });

    if (filter.minAmount !== undefined)
      qb.andWhere('o.grandTotal::numeric >= :minA', { minA: filter.minAmount });
    if (filter.maxAmount !== undefined)
      qb.andWhere('o.grandTotal::numeric <= :maxA', { maxA: filter.maxAmount });

    if (filter.search) {
      qb.andWhere(
        new Brackets((sq) => {
          sq.where('o.orderNo ILIKE :q', { q: `%${filter.search}%` })
            .orWhere('user.name ILIKE :q', { q: `%${filter.search}%` })
            .orWhere('items.name ILIKE :q', { q: `%${filter.search}%` });
        }),
      );
    }

    const sortBy = filter.sortBy ?? 'createdAt';
    const sortOrder = (filter.sortOrder ?? 'DESC') as 'ASC' | 'DESC';
    const orderCol = sortBy === 'grandTotal' ? 'o.grandTotal::numeric' : `o.${sortBy}`;
    qb.orderBy(orderCol, sortOrder)
      .take(limit)
      .skip((page - 1) * limit);

    const [data, total] = await qb.getManyAndCount();

    

    return { data, total, page, limit };
  }

  // =========================
  // UPDATE ORDER DETAILS (USER/ADMIN)
  // =========================

  async updateOrder(orderId: string, dto: UpdateOrderDto, user: RequestUser) {
    const order = await this.getOrderById(orderId, user);

    // only allow user update in early stages (admin can always update)
    if (!this.isAdmin(user)) {
      if (
        ![OrderStatusEnum.CREATED, OrderStatusEnum.PENDING].includes(
          order.status,
        )
      ) {
        throw new BadRequestException('Order cannot be edited at this stage');
      }
    }

    if (dto.couponCode !== undefined) order.couponCode = dto.couponCode;
    if (dto.couponDiscount !== undefined)
      order.couponDiscount = dto.couponDiscount.toFixed(2);
    if (dto.shippingTotal !== undefined)
      order.shippingTotal = dto.shippingTotal.toFixed(2);
    if (dto.feeTotal !== undefined) order.feeTotal = dto.feeTotal.toFixed(2);

    if (dto.billingDetails !== undefined)
      order.billingDetails = dto.billingDetails as any;
    if (dto.shippingDetails !== undefined)
      order.shippingDetails = dto.shippingDetails as any;
    if (dto.serviceDetails !== undefined)
      order.serviceDetails = dto.serviceDetails as any;
    if (dto.taxBreakup !== undefined) order.taxBreakup = dto.taxBreakup as any;

    if (dto.meta !== undefined)
      order.meta = { ...(order.meta ?? {}), ...(dto.meta ?? {}) };

    // recompute totals based on existing items
    const items = await this.orderItemRepo.find({
      where: { order: { id: order.id } as any },
    });

    const totals = this.computeTotals({
      items: items.map((it) => ({
        mrp: Number(it.mrp),
        sellingPrice: Number(it.sellingPrice),
        taxPercent: Number(it.taxPercent),
        quantity: it.quantity,
      })),
      couponDiscount: Number(order.couponDiscount ?? 0),
      shippingTotal: Number(order.shippingTotal ?? 0),
      feeTotal: Number(order.feeTotal ?? 0),
    });

    order.subTotal = totals.subTotal;
    order.discountTotal = totals.discountTotal;
    order.taxTotal = totals.taxTotal;
    order.grandTotal = totals.grandTotal;

    // amountDue = grandTotal - amountPaid
    const due = Math.max(
      Number(order.grandTotal) - Number(order.amountPaid ?? 0),
      0,
    );
    order.amountDue = due.toFixed(2);

    await this.orderRepo.save(order);
    return this.getOrderById(order.id, user);
  }

  // =========================
  // UPDATE STATUS (ADMIN)
  // =========================

  async updateOrderStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
    user: RequestUser,
  ) {
    this.assertAdmin(user);

    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items', 'user', 'branch'],
    });

    if (!order) throw new NotFoundException('Order not found');

    const oldStatus = order.status;
    order.status = dto.status;
    this.pushHistory(order, dto.status, user.id, dto.note);

    if (dto.status === OrderStatusEnum.SHIPPED || dto.status === OrderStatusEnum.OUT_FOR_DELIVERY) {
      const existing = (order.shippingDetails || {}) as Record<string, any>;
      order.shippingDetails = {
        ...existing,
        courierName: dto.courierName ?? existing.courierName,
        trackingId: dto.trackingId ?? existing.trackingId,
        shippedAt: dto.status === OrderStatusEnum.SHIPPED ? new Date().toISOString() : existing.shippedAt,
      };
    }
    if (dto.status === OrderStatusEnum.DELIVERED) {
      const existing = (order.shippingDetails || {}) as Record<string, any>;
      order.shippingDetails = {
        ...existing,
        deliveredAt: new Date().toISOString(),
      };
    }

    await this.orderRepo.save(order);
    this.emitStatusChanged(order, dto.status, oldStatus, user.id);
    return this.getOrderById(order.id, user);
  }

  // =========================
  // CANCEL (USER)
  // =========================

  async cancelOrder(orderId: string, dto: CancelOrderDto, user: RequestUser) {
    const order = await this.getOrderById(orderId, user);

    if (!this.isAdmin(user) && order.user?.id !== user.id) {
      throw new ForbiddenException('You cannot cancel this order');
    }

    const cancellableStatuses = [
      OrderStatusEnum.CREATED,
      OrderStatusEnum.PENDING,
      OrderStatusEnum.CONFIRMED,
    ];
    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    const oldStatus = order.status;
    order.status = OrderStatusEnum.CANCELLED;
    order.cancelReason = dto.reason ?? 'Cancelled by user';
    this.pushHistory(
      order,
      OrderStatusEnum.CANCELLED,
      user.id,
      order.cancelReason,
    );

    await this.orderRepo.save(order);
    this.emitStatusChanged(order, OrderStatusEnum.CANCELLED, oldStatus, user.id);

    // release reserved inventory
    await this.releaseInventoryForOrder(order.id);

    const updated = await this.getOrderById(order.id, user);
    const isPropertyPremium = order.type === OrderType.PROPERTY_PREMIUM;
    const wasPaid = Number(order.amountPaid ?? 0) > 0;
    const refundNote =
      wasPaid && isPropertyPremium
        ? 'No refund. Your listing feature will be disabled from the next billing cycle.'
        : wasPaid
          ? 'Refund will be processed to your original payment method.'
          : undefined;
    return { ...updated, message: 'Order cancelled.', refundNote };
  }

  // =========================
  // RETURN REQUEST (USER)
  // =========================

  async requestReturn(
    orderId: string,
    dto: RequestReturnDto,
    user: RequestUser,
  ) {
    const order = await this.getOrderById(orderId, user);

    if (!order.user || order.user.id !== user.id) {
      throw new ForbiddenException('Only customer can request return');
    }

    if (order.status !== OrderStatusEnum.DELIVERED) {
      throw new BadRequestException('Order is not eligible for return');
    }

    const oldStatus = order.status;
    order.status = OrderStatusEnum.RETURN_REQUESTED;
    order.returnReason = dto.reason;
    order.returnComment = dto.comment;
    order.returnImages = dto.images ?? [];
    order.returnRequestedAt = new Date();

    this.pushHistory(
      order,
      OrderStatusEnum.RETURN_REQUESTED,
      user.id,
      dto.comment,
    );

    await this.orderRepo.save(order);
    this.emitStatusChanged(order, OrderStatusEnum.RETURN_REQUESTED, oldStatus, user.id);
    return this.getOrderById(order.id, user);
  }

  // =========================
  // RETURN PROCESS (ADMIN)
  // =========================

  async processReturn(
    orderId: string,
    dto: ProcessReturnDto,
    user: RequestUser,
  ) {
    this.assertAdmin(user);

    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items', 'user', 'branch'],
    });

    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== OrderStatusEnum.RETURN_REQUESTED) {
      throw new BadRequestException('No return request found for this order');
    }

    const oldStatus = order.status;
    if (dto.approve) {
      order.status = OrderStatusEnum.RETURN_APPROVED;
      order.returnApprovedAt = new Date();
      order.refundAmount = order.grandTotal;

      this.pushHistory(
        order,
        OrderStatusEnum.RETURN_APPROVED,
        user.id,
        'Return approved',
      );

      await this.releaseInventoryForOrder(order.id);
    } else {
      order.status = OrderStatusEnum.RETURN_REJECTED;
      order.returnRejectedAt = new Date();
      order.returnRejectedReason = dto.rejectionReason ?? 'Return rejected';

      this.pushHistory(
        order,
        OrderStatusEnum.RETURN_REJECTED,
        user.id,
        order.returnRejectedReason,
      );
    }

    await this.orderRepo.save(order);
    this.emitStatusChanged(order, order.status, oldStatus, user.id);
    return this.getOrderById(order.id, user);
  }

  // =========================
  // DELETE (ADMIN)
  // =========================

  async deleteOrder(orderId: string, user: RequestUser) {
    this.assertAdmin(user);

    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order not found');

    // If still reserved and not completed/delivered etc, release before delete
    const releaseStatuses = [
      OrderStatusEnum.CREATED,
      OrderStatusEnum.PENDING,
      OrderStatusEnum.CONFIRMED,
      OrderStatusEnum.CANCELLED,
      OrderStatusEnum.RETURN_REJECTED,
    ];
    if (releaseStatuses.includes(order.status)) {
      await this.releaseInventoryForOrder(order.id);
    }

    await this.orderRepo.delete(order.id);
    return { success: true };
  }

  // ---------------- EXISTING CATEGORY MAP ----------------

  private mapCategoryToOrderItemType(category: string): OrderItemType {
    const cat = category?.toLowerCase();

    switch (cat) {
      case 'furniture':
        return OrderItemType.FURNITURE_PRODUCT;
      case 'electronics':
        return OrderItemType.ELECTRONICS_PRODUCT;
      case 'homedecor':
      case 'home_decor':
      case 'home-decor':
        return OrderItemType.HOME_DECOR_PRODUCT;

      case 'interior':
      case 'interiors':
      case 'interior_package':
        return OrderItemType.INTERIOR_PACKAGE;

      case 'legal':
      case 'legal_service':
        return OrderItemType.LEGAL_PACKAGE;

      case 'custom_builder':
      case 'custom_builder_package':
        return OrderItemType.CUSTOM_BUILDER_PACKAGE;

      case 'property_premium':
      case 'property_premium_plan':
        return OrderItemType.PROPERTY_PREMIUM_PLAN;

      case 'property_booking':
      case 'booking_token':
        return OrderItemType.PROPERTY_BOOKING_TOKEN;

      default:
        return OrderItemType.GENERIC_SERVICE;
    }
  }

  // =========================
  // ASSIGN SERVICE AGENT (Legal / Solar / Generic service orders)
  // =========================

  async assignServiceAgent(
    orderId: string,
    agentUserId: string,
    user: RequestUser,
  ) {
    this.assertAdmin(user);

    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items', 'user', 'branch'],
    });
    if (!order) throw new NotFoundException('Order not found');

    const oldStatus = order.status;
    const existing = (order.serviceDetails ?? {}) as Record<string, any>;
    order.serviceDetails = {
      ...existing,
      assignedToUserId: agentUserId,
      assignedAt: new Date().toISOString(),
    };

    if (
      order.status === OrderStatusEnum.CONFIRMED ||
      order.status === OrderStatusEnum.CREATED
    ) {
      order.status = OrderStatusEnum.ASSIGNED;
      this.pushHistory(order, OrderStatusEnum.ASSIGNED, user.id, `Agent ${agentUserId} assigned`);
    }

    await this.orderRepo.save(order);
    this.emitStatusChanged(order, order.status, oldStatus, user.id);
    return this.getOrderById(order.id, user);
  }

  // =========================
  // PUBLIC TRACKING TIMELINE
  // =========================

  async getOrderTracking(orderId: string, userId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items', 'user'],
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.user?.id !== userId) {
      throw new ForbiddenException('You can only track your own orders');
    }

    const shipping = (order.shippingDetails ?? {}) as Record<string, any>;
    const service = (order.serviceDetails ?? {}) as Record<string, any>;
    const history = (order.statusHistory ?? []) as Array<{ status: string; at: string; note?: string }>;

    const isServiceOrder = [
      OrderType.SOLAR, OrderType.LEGAL, OrderType.SERVICE,
      OrderType.CUSTOM_BUILDER, OrderType.INTERIORS,
    ].includes(order.type as OrderType);

    const timeline = history.map((h) => {
      const entry: any = {
        status: h.status,
        at: h.at,
        label: this.statusLabel(h.status, order.type, shipping),
      };
      if (h.status === 'SHIPPED' && shipping.courierName) {
        entry.meta = {
          courier: shipping.courierName,
          awb: shipping.trackingId,
        };
      }
      if (h.status === 'ASSIGNED' && service.assignedToUserId) {
        entry.meta = { agentAssigned: true };
      }
      return entry;
    });

    const result: any = {
      orderId: order.id,
      orderNo: order.orderNo,
      type: order.type,
      currentStatus: order.status,
      timeline,
    };

    if (shipping.trackingId) {
      result.trackingId = shipping.trackingId;
      result.courierName = shipping.courierName;
      result.trackingUrl = shipping.trackingId
        ? `https://shiprocket.co/tracking/${shipping.trackingId}`
        : undefined;
    }

    if (shipping.etd || shipping.estimatedDelivery) {
      result.estimatedDelivery = shipping.etd || shipping.estimatedDelivery;
    }

    if (isServiceOrder) {
      result.serviceType = order.type;
      if (service.assignedToUserId) result.agentAssigned = true;
      if (service.scheduleDate) result.scheduleDate = service.scheduleDate;
    }

    return result;
  }

  private statusLabel(status: string, orderType: string, shipping: Record<string, any>): string {
    const labels: Record<string, string> = {
      CREATED: 'Order Placed',
      PENDING: 'Payment Pending',
      CONFIRMED: 'Order Confirmed',
      ASSIGNED: orderType === 'SOLAR' ? 'Agent Assigned for Installation'
        : orderType === 'LEGAL' ? 'Legal Agent Assigned'
          : 'Agent Assigned',
      IN_PROGRESS: orderType === 'SOLAR' ? 'Installation In Progress'
        : orderType === 'LEGAL' ? 'Legal Service In Progress'
          : 'In Progress',
      SHIPPED: shipping.courierName ? `Shipped via ${shipping.courierName}` : 'Shipped',
      OUT_FOR_DELIVERY: 'Out for Delivery',
      DELIVERED: 'Delivered',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      RETURN_REQUESTED: 'Return Requested',
      RETURN_APPROVED: 'Return Approved',
      RETURN_REJECTED: 'Return Rejected',
      RETURNED: 'Returned',
      REFUNDED: 'Refunded',
    };
    return labels[status] ?? status;
  }
}
