import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import {
  CustomerNotificationResourceType,
  CustomerNotificationType,
} from '../enums/customer-notification.enum';

@Entity('customer_notifications')
export class CustomerNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 10 })
  mobileSuffix: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  customerId: string | null;

  @Column({ type: 'varchar', length: 64 })
  type: CustomerNotificationType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'varchar', length: 512 })
  href: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  resourceType: CustomerNotificationResourceType | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  resourceId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, unknown> | null;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
