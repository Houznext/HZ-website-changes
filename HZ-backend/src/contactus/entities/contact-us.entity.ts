import { Entity, PrimaryGeneratedColumn, Column,CreateDateColumn,ManyToOne } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
@Entity('contact_us')
export class ContactUs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: false })
  contactNumber: string;

  @Column({ nullable: false })
  emailAddress: string;

  @Column({ type: 'text', nullable: true })
  tellUsMore: string;

  @Column({ nullable: true })
  serviceType?: string;

  @Column({ nullable: true })
  city?: string;

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
