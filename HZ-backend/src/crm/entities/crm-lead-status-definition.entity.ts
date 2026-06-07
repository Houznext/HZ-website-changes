import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('crm_lead_status_definition')
export class CrmLeadStatusDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Stored on `crm.leadstatus` — must be unique */
  @Column({ type: 'varchar', length: 120, unique: true })
  value: string;

  /** Admin-facing label (may differ from value) */
  @Column({ type: 'varchar', length: 200, default: '' })
  label: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  /** Seeded from legacy enum — cannot be deleted; value cannot change */
  @Column({ type: 'boolean', default: false })
  isBuiltin: boolean;

  /** Pre-selected lead status when adding a new lead */
  @Column({ type: 'boolean', default: false })
  isDefault: boolean;
}
