import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('site_page_seo')
export class SitePageSeo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 512, unique: true })
  path: string;

  @Column({ type: 'varchar', length: 256 })
  label: string;

  @Column({ type: 'varchar', length: 200 })
  metaTitle: string;

  @Column({ type: 'text' })
  metaDescription: string;

  @Column({ type: 'text', nullable: true })
  ogImageUrl: string | null;

  /** Whether the live page is expected to emit JSON-LD (for admin coverage). */
  @Column({ type: 'boolean', default: false })
  hasStructuredData: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
