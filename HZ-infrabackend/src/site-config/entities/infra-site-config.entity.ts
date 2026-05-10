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

  @Column({ type: 'int', default: 18 })
  heroOpacity: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
