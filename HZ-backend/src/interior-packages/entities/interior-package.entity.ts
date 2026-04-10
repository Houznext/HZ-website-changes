import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('interior_package')
export class InteriorPackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  price: string;

  @Column({ type: 'varchar', length: 100, default: 'onwards' })
  suffix: string;

  @Column({ type: 'varchar', length: 20, default: '#5a6a7e' })
  color: string;

  @Column({ type: 'jsonb', default: '[]' })
  features: string[];

  @Column({ type: 'boolean', default: false })
  highlighted: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  bhkType: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
