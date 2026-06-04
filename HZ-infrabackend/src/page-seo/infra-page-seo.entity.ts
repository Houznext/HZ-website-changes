import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('infra_page_seo')
export class InfraPageSeo {
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

  @Column({ type: 'boolean', default: false })
  hasStructuredData: boolean;

  @Column({ type: 'boolean', default: false })
  noIndex: boolean;

  @Column({ type: 'varchar', length: 512, nullable: true })
  keywords: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
