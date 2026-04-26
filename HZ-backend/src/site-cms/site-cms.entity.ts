import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('site_cms_entries')
export class SiteCmsEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  key: string;

  @Column({ type: 'text', default: '{}' })
  data: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
