import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  Unique,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cart } from 'src/cart/entities/cart.entity';
import { OrderItemType } from 'src/orders/enum/order.enum';

export type CartItemSnapshot = {
  source?: string;
  sku?: string;
  variantId?: string;
  image?: string;
  brand?: string;
  attributes?: Record<string, any>;
};

@Entity('cart_items')
@Unique('UQ_cart_product_variant', [
  'cartId',
  'productId',
  'variantId',
  'productType',
])
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  cartId: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @Column({ type: 'enum', enum: OrderItemType })
  productType: OrderItemType;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  productId: string;

  @Index()
  @Column({ nullable: true, type: 'varchar', length: 255 })
  variantId?: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  mrp: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  sellingPrice: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  unitDiscount: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  itemSubTotal: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  taxPercent: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  taxAmount: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  discountAmount: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  itemTotal: string;

  @Column({ type: 'jsonb', nullable: true })
  snapshot?: CartItemSnapshot;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
