import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { QcCheckpointTemplate } from './qc-checkpoint-template.entity';
import { ScopeOfWork } from './scope-of-work.entity';

@Entity('bl_scope_templates')
export class ScopeTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  iconName?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'int', default: 10 })
  defaultWeightage: number;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'bool', default: true })
  isActive: boolean;

  @Column({ type: 'bool', default: false })
  isCustom: boolean;

  @OneToMany(
    () => QcCheckpointTemplate,
    (checkpoint) => checkpoint.scopeTemplate,
    { cascade: ['remove'] },
  )
  checkpointTemplates: QcCheckpointTemplate[];

  @OneToMany(() => ScopeOfWork, (scope) => scope.template)
  scopes: ScopeOfWork[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

