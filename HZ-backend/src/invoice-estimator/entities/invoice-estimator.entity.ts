import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';

@Entity()
export class InvoiceEstimator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Branch, (branch) => branch.invoiceEstimators, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch | null;

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId?: string;

  /** Legacy LiveBuild project link (column retained; relation removed in rebuild). */
  @Column({ name: 'custombuilderid', type: 'uuid', nullable: true })
  customBuilderId?: string | null;

  // 🔹 User who created/posted the invoice (from payload)
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.invoiceEstimators, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'posted_by_id' })
  postedBy: User;

  @Column('text')
  billToName: string;

  @Column('text')
  billToAddress: string;

  @Column('text')
  billToCity: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  subTotal: number;

  @Column('text')
  shipToAddress: string;

  @Column('text')
  shipToCity: string;

  @Column('text')
  invoiceNumber: string;

  @Column('text')
  invoiceDate: string;

  @Column('text')
  invoiceDue: string;

  @Column('text')
  invoiceTerms: string;

  @Column({ type: 'varchar', nullable: true })
  customerMobile: string | null;

  @Column('jsonb', { nullable: true })
  items: {
    item_name: string;
    description?: string;
    quantity: number;
    price: number;
    area?: number;
  }[];
}
