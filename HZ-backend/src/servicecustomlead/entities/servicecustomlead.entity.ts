import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn,} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
@Entity('servicecustomlead')
export class ServiceCustomLead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ nullable: true })
  phonenumber: string;

  @Column()
  description: string;

  @Column({ type: 'varchar', nullable: true })
  serviceType?: string;

  @Column({ type: 'varchar', nullable: true })
  solarType?: string;

  @Column({ type: 'varchar', nullable: true })
  category?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  monthlyBill?: string;

  /** Structured solar quote (for Solar leads). Stored as JSON for proper shape and UI display. */
  @Column({ type: 'jsonb', nullable: true })
  solarQuoteSnapshot?: Record<string, any>;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  leadstatus?: string;
  @ManyToOne(() => User, (user) => user.serviceleads, { nullable: true })
  assignedTo?: User;

  @ManyToOne(() => User, { nullable: true })
  assignedBy?: User;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  createdAt: Date;
}
