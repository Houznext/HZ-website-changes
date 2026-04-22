import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('hz_cms_content')
export class CmsContent {
  @PrimaryColumn({ type: 'varchar' })
  key: string; // e.g. 'interiors_page' | 'design_ideas_page'

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any> | null;

  @Column({ type: 'varchar', default: 'draft' })
  status: string; // 'draft' | 'published'

  @UpdateDateColumn()
  updatedAt: Date;
}
