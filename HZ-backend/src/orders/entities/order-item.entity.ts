import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { Order } from './order.entity';
import { OrderItemType } from '../enum/order.enum';

export type OrderItemSnapshot = {
  source?: string;
  sku?: string;
  variantId?: string;
  image?: string;
  brand?: string;
  attributes?: Record<string, any>;
};

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @Column({ type: 'enum', enum: OrderItemType })
  productType: OrderItemType;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  productId: string;

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

  // -------- ITEM TOTALS --------
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
  snapshot?: OrderItemSnapshot;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;
}
