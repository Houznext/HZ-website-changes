import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LivebuildCustomer } from './livebuild-customer.entity';
import { LivebuildRoom } from './livebuild-room.entity';
import { LivebuildPayment } from './livebuild-payment.entity';
import { LivebuildQuery } from './livebuild-query.entity';
import { LivebuildDocument } from './livebuild-document.entity';
import { LivebuildMaterial } from './livebuild-material.entity';
import { LivebuildDpr } from './livebuild-dpr.entity';
import { LivebuildPropertyInfo } from './livebuild-property-info.entity';

@Entity('livebuild_projects')
export class LivebuildProject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'project_code', type: 'varchar', length: 20, unique: true })
  projectCode: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'customer_id', type: 'int', nullable: true })
  customerId: number | null;

  @ManyToOne(() => LivebuildCustomer, (c) => c.projects, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: LivebuildCustomer | null;

  @Column({ name: 'customer_mobile', type: 'varchar', length: 20 })
  customerMobile: string;

  @Column({ name: 'property_type', type: 'varchar', length: 100, nullable: true })
  propertyType: string | null;

  @Column({ name: 'project_type', type: 'varchar', length: 100, nullable: true })
  projectType: string | null;

  @Column({ name: 'site_manager', type: 'varchar', length: 255, nullable: true })
  siteManager: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: string | null;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: string | null;

  @Column({ type: 'varchar', length: 20, default: 'progress' })
  status: string;

  @Column({ type: 'varchar', length: 50, default: 'Design' })
  phase: string;

  @Column({ name: 'pct_method', type: 'varchar', length: 20, default: 'hybrid' })
  pctMethod: string;

  @Column({ name: 'overall_pct', type: 'int', default: 0 })
  overallPct: number;

  @Column({ name: 'pct_override', type: 'int', nullable: true })
  pctOverride: number | null;

  @Column({ name: 'pct_override_reason', type: 'text', nullable: true })
  pctOverrideReason: string | null;

  @Column({ name: 'hold_reason', type: 'text', nullable: true })
  holdReason: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => LivebuildRoom, (r) => r.project)
  rooms: LivebuildRoom[];

  @OneToMany(() => LivebuildPayment, (p) => p.project)
  payments: LivebuildPayment[];

  @OneToMany(() => LivebuildQuery, (q) => q.project)
  queries: LivebuildQuery[];

  @OneToMany(() => LivebuildDocument, (d) => d.project)
  documents: LivebuildDocument[];

  @OneToMany(() => LivebuildMaterial, (m) => m.project)
  materials: LivebuildMaterial[];

  @OneToMany(() => LivebuildDpr, (d) => d.project)
  dprEntries: LivebuildDpr[];

  @OneToOne(() => LivebuildPropertyInfo, (p) => p.project)
  propertyInfo: LivebuildPropertyInfo | null;
}
