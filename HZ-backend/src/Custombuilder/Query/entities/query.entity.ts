import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { QueryStatus } from '../enum/query.enum';
import { User } from 'src/user/entities/user.entity';
import { CustomBuilder } from '../../entities/custom-builder.entity';

@Entity()
export class CBQuery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ type: 'enum', enum: QueryStatus, default: QueryStatus.ACTIVE })
  status: QueryStatus;

  @Column({ type: 'text', nullable: true })
  adminReply: string;

  @ManyToOne(() => User, (user) => user.queries, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => CustomBuilder, (cb) => cb.queries, { onDelete: 'CASCADE' })
  customBuilder: CustomBuilder;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
