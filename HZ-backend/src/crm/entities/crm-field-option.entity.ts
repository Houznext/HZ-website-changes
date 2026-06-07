import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { CrmFieldOptionType } from '../enums/crm-field-option-type.enum';

@Entity('crm_field_option')
@Index(['fieldType', 'value'], { unique: true })
export class CrmFieldOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 40 })
  fieldType: CrmFieldOptionType;

  /** Stored on the lead record */
  @Column({ type: 'varchar', length: 120 })
  value: string;

  /** Admin-facing label (may differ from value) */
  @Column({ type: 'varchar', length: 200, default: '' })
  label: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  /** Seeded defaults — value cannot change; deletion restricted when in use */
  @Column({ type: 'boolean', default: false })
  isBuiltin: boolean;

  /** Pre-selected in add-lead form (one per fieldType) */
  @Column({ type: 'boolean', default: false })
  isDefault: boolean;
}
