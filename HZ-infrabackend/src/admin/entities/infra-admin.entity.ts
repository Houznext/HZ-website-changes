import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('infra_admin')
export class InfraAdmin {
  @PrimaryGeneratedColumn('uuid')
  adminId: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ default: 'admin' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;
}
