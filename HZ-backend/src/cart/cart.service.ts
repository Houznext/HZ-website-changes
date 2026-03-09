import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cart } from './entities/cart.entity';
import { CartItem } from 'src/cartItems/entities/cartitem.entity';
import { User } from 'src/user/entities/user.entity';

import { AddToCartDto, SyncCartDto, UpdateCartItemDto } from './dtos/cart-item.dto';
import { UpdateCartMetaDto } from './dtos/cart.dto';
import { OrderType, deriveOrderTypeFromItemTypes } from 'src/orders/enum/order.enum';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private toNum(v: any): number {
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? n : 0;
  }

  private money(n: number): string {
    return (Math.round(n * 100) / 100).toFixed(2);
  }

  private computeItemTotals(dto: {
    sellingPrice: any;
    quantity: any;
    unitDiscount?: any;
    taxPercent?: any;
  }) {
    const sellingPrice = this.toNum(dto.sellingPrice);
    const qty = Math.max(this.toNum(dto.quantity), 1);

    const unitDiscount = this.toNum(dto.unitDiscount);
    const discountAmount = unitDiscount * qty;

    const itemSubTotal = sellingPrice * qty; // before tax
    const taxPercent = this.toNum(dto.taxPercent);
    const taxAmount = (itemSubTotal * taxPercent) / 100;

    const itemTotal = itemSubTotal + taxAmount - discountAmount;

    return {
      itemSubTotal: this.money(itemSubTotal),
      taxPercent: this.money(taxPercent),
      taxAmount: this.money(taxAmount),
      discountAmount: this.money(discountAmount),
      itemTotal: this.money(itemTotal),
    };
  }

  private computeCartTotals(cart: Cart) {
    const items = cart.items ?? [];

    const subTotal = items.reduce((s, i) => s + this.toNum(i.itemSubTotal), 0);
    const discountTotal = items.reduce((s, i) => s + this.toNum(i.discountAmount), 0);
    const taxTotal = items.reduce((s, i) => s + this.toNum(i.taxAmount), 0);

    const couponDiscount = this.toNum(cart.couponDiscount);
    const shippingTotal = this.toNum(cart.shippingTotal);
    const feeTotal = this.toNum(cart.feeTotal);

    const grandTotal = subTotal + taxTotal + shippingTotal + feeTotal - discountTotal - couponDiscount;

    cart.subTotal = this.money(subTotal);
    cart.discountTotal = this.money(discountTotal);
    cart.taxTotal = this.money(taxTotal);
    cart.grandTotal = this.money(Math.max(grandTotal, 0));
  }

  private async loadCartOrCreate(userId: string): Promise<Cart> {
    let cart = await this.cartRepo.findOne({
      where: { userId },
      relations: ['items'],
    });

    if (!cart) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      cart = this.cartRepo.create({
        userId,
        type: OrderType.FURNITURE, 
        user,
        currency: 'INR',
        subTotal: '0.00',
        discountTotal: '0.00',
        couponDiscount: '0.00',
        taxTotal: '0.00',
        shippingTotal: '0.00',
        feeTotal: '0.00',
        grandTotal: '0.00',
        items: [],
      });

      cart = await this.cartRepo.save(cart);
    }

    return cart;
  }

  async getOrCreateCart(userId: string) {
    const cart = await this.loadCartOrCreate(userId);
    this.computeCartTotals(cart);
    await this.cartRepo.save(cart);
    return this.cartRepo.findOne({ where: { id: cart.id }, relations: ['items'] });
  }

  async addItem(userId: string, dto: AddToCartDto) {
    const cart = await this.loadCartOrCreate(userId);
    console.log("cartdto",dto)

    const qty = dto.quantity ?? 1;
    if (qty < 1) throw new BadRequestException('Quantity must be >= 1');

    const existing = cart.items.find(
      (i) =>
        i.productId === dto.productId &&
        (i.variantId ?? null) === (dto.variantId ?? null) &&
        i.productType === dto.productType,
    );

    if (existing) {
      existing.quantity += qty;

      // optionally update snapshot/name/price if you want latest values
      existing.name = dto.name ?? existing.name;
      existing.description = dto.description ?? existing.description;
      existing.mrp = this.money(this.toNum(dto.mrp));
      existing.sellingPrice = this.money(this.toNum(dto.sellingPrice));
      existing.unitDiscount = this.money(this.toNum(dto.unitDiscount));
      existing.taxPercent = this.money(this.toNum(dto.taxPercent));
      if (dto.snapshot) existing.snapshot = dto.snapshot as any;
      if (dto.meta) existing.meta = { ...(existing.meta ?? {}), ...(dto.meta ?? {}) };

      Object.assign(existing, this.computeItemTotals(existing));
      await this.cartItemRepo.save(existing);
    } else {
      const item = this.cartItemRepo.create({
        cartId: cart.id,
        cart,
        productType: dto.productType,
        productId: dto.productId,
        variantId: dto.variantId,
        name: dto.name,
        description: dto.description,
        mrp: this.money(this.toNum(dto.mrp)),
        sellingPrice: this.money(this.toNum(dto.sellingPrice)),
        unitDiscount: this.money(this.toNum(dto.unitDiscount)),
        quantity: qty,
        ...this.computeItemTotals({
          sellingPrice: dto.sellingPrice,
          quantity: qty,
          unitDiscount: dto.unitDiscount,
          taxPercent: dto.taxPercent,
        }),
        snapshot: dto.snapshot as any,
        meta: dto.meta,
      });

      await this.cartItemRepo.save(item);
    }

    // refresh cart items + totals and sync cart.type (supports mixed: ecommerce + legal + property premium etc.)
    const updated = await this.cartRepo.findOne({ where: { id: cart.id }, relations: ['items'] });
    const itemTypes = (updated?.items ?? []).map((i) => i.productType);
    if (updated && itemTypes.length > 0) {
      updated.type = deriveOrderTypeFromItemTypes(itemTypes);
    }
    this.computeCartTotals(updated);
    await this.cartRepo.save(updated);

    return this.cartRepo.findOne({ where: { id: cart.id }, relations: ['items'] });
  }

  async  updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.loadCartOrCreate(userId);

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('Cart item not found');

    if (dto.quantity !== undefined) {
      if (dto.quantity < 1) throw new BadRequestException('Quantity must be >= 1');
      item.quantity = dto.quantity;
    }

    if (dto.name !== undefined) item.name = dto.name;
    if (dto.description !== undefined) item.description = dto.description;

    if (dto.mrp !== undefined) item.mrp = this.money(this.toNum(dto.mrp));
    if (dto.sellingPrice !== undefined) item.sellingPrice = this.money(this.toNum(dto.sellingPrice));
    if (dto.unitDiscount !== undefined) item.unitDiscount = this.money(this.toNum(dto.unitDiscount));
    if (dto.taxPercent !== undefined) item.taxPercent = this.money(this.toNum(dto.taxPercent));

    if (dto.snapshot !== undefined) item.snapshot = dto.snapshot as any;
    if (dto.meta !== undefined) item.meta = { ...(item.meta ?? {}), ...(dto.meta ?? {}) };

    Object.assign(
      item,
      this.computeItemTotals({
        sellingPrice: item.sellingPrice,
        quantity: item.quantity,
        unitDiscount: item.unitDiscount,
        taxPercent: item.taxPercent,
      }),
    );

    await this.cartItemRepo.save(item);

    const updated = await this.cartRepo.findOne({ where: { id: cart.id }, relations: ['items'] });
    const itemTypes = (updated?.items ?? []).map((i) => i.productType);
    if (updated && itemTypes.length > 0) {
      updated.type = deriveOrderTypeFromItemTypes(itemTypes);
    }
    this.computeCartTotals(updated);
    await this.cartRepo.save(updated);

    return updated;
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.loadCartOrCreate(userId);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('Cart item not found');

    await this.cartItemRepo.delete(itemId);

    const updated = await this.cartRepo.findOne({ where: { id: cart.id }, relations: ['items'] });
    const itemTypes = (updated?.items ?? []).map((i) => i.productType);
    if (updated && itemTypes.length > 0) {
      updated.type = deriveOrderTypeFromItemTypes(itemTypes);
    } else if (updated) {
      updated.type = OrderType.STORE;
    }
    this.computeCartTotals(updated);
    await this.cartRepo.save(updated);

    return { message: 'Cart item removed', cart: updated };
  }

  async clear(userId: string) {
    const cart = await this.loadCartOrCreate(userId);
    await this.cartItemRepo.delete({ cartId: cart.id });

    cart.items = [];
    cart.type = OrderType.STORE;
    this.computeCartTotals(cart);
    await this.cartRepo.save(cart);

    return { message: 'Cart cleared', cart };
  }

  async updateMeta(userId: string, dto: UpdateCartMetaDto) {
    const cart = await this.loadCartOrCreate(userId);

    // update allowed fields only
    if (dto.type !== undefined) cart.type = dto.type;
    if (dto.currency !== undefined) cart.currency = dto.currency;
    if (dto.couponCode !== undefined) cart.couponCode = dto.couponCode;

    if (dto.billingDetails !== undefined) cart.billingDetails = dto.billingDetails as any;
    if (dto.shippingDetails !== undefined) cart.shippingDetails = dto.shippingDetails as any;
    if (dto.serviceDetails !== undefined) cart.serviceDetails = dto.serviceDetails as any;
    if (dto.taxBreakup !== undefined) cart.taxBreakup = dto.taxBreakup as any;

    if (dto.meta !== undefined) cart.meta = { ...(cart.meta ?? {}), ...(dto.meta ?? {}) };

    // coupon calculation is business logic; keep 0 unless you apply coupon rules here
    // cart.couponDiscount = '0.00';

    this.computeCartTotals(cart);
    await this.cartRepo.save(cart);

    return this.cartRepo.findOne({ where: { id: cart.id }, relations: ['items'] });
  }

  async sync(userId: string, dto: SyncCartDto) {
    const cart = await this.loadCartOrCreate(userId);

    await this.cartItemRepo.delete({ cartId: cart.id });

    const newItems = dto.items.map((i) => {
      const qty = i.quantity ?? 1;
      const totals = this.computeItemTotals({
        sellingPrice: i.sellingPrice,
        quantity: qty,
        unitDiscount: i.unitDiscount,
        taxPercent: i.taxPercent,
      });

      return this.cartItemRepo.create({
        cartId: cart.id,
        cart,
        productType: i.productType,
        productId: i.productId,
        variantId: i.variantId,
        name: i.name,
        description: i.description,
        mrp: this.money(this.toNum(i.mrp)),
        sellingPrice: this.money(this.toNum(i.sellingPrice)),
        unitDiscount: this.money(this.toNum(i.unitDiscount)),
        quantity: qty,
        ...totals,
        snapshot: i.snapshot as any,
        meta: i.meta,
      });
    });

    await this.cartItemRepo.save(newItems);

    const updated = await this.cartRepo.findOne({ where: { id: cart.id }, relations: ['items'] });
    const itemTypes = (updated?.items ?? []).map((i) => i.productType);
    if (updated && itemTypes.length > 0) {
      updated.type = deriveOrderTypeFromItemTypes(itemTypes);
    }
    this.computeCartTotals(updated);
    await this.cartRepo.save(updated);

    return updated;
  }
}
