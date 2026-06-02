import { Column, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity('infra_site_config')
@Unique(['configKey'])
export class InfraSiteConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'default' })
  configKey: string;

  @Column({ type: 'text', nullable: true })
  heroImageUrl: string | null;

  @Column({ type: 'simple-json', nullable: true })
  heroImageUrls: string[] | null;

  @Column({ type: 'text', nullable: true })
  heroHeadline: string | null;

  @Column({ type: 'text', nullable: true })
  heroSubheadline: string | null;

  @Column({ type: 'int', default: 18 })
  heroOpacity: number;

  @Column({ type: 'simple-json', nullable: true })
  heroPopularTags: string[] | null;

  @Column({ type: 'simple-json', nullable: true })
  heroMetrics: { value: string; label: string; accent?: boolean }[] | null;

  /** Browse-by-type home cards: { Land, Villa, Apartment, Plot } image URLs. */
  @Column({ type: 'simple-json', nullable: true })
  browseTypeImages: Record<string, string> | null;

  /** Generic JSON payload for homepage section CMS rows (featured_projects, browse_by_city, etc.). */
  @Column({ type: 'simple-json', nullable: true })
  sectionPayload: Record<string, unknown> | null;

  @UpdateDateColumn()
  updatedAt: Date;
}
