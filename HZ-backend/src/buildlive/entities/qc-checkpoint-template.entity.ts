import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { ScopeTemplate } from './scope-template.entity';

@Entity('bl_qc_checkpoint_templates')
export class QcCheckpointTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ScopeTemplate, (scope) => scope.checkpointTemplates, {
    onDelete: 'CASCADE',
  })
  scopeTemplate: ScopeTemplate;

  @Column({ type: 'varchar', length: 255 })
  checkpointName: string;

  @Column({ type: 'bool', default: true })
  isMandatory: boolean;

  @Column({ type: 'int', default: 0 })
  sequence: number;
}

