import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ nullable: true, default: null })
  email: string;

  @Column({ nullable: true, default: null })
  phone: string;

  @Column()
  otp: string;

  @Column({ type: 'int', default: 0 })
  retryAttempts: number;
}
