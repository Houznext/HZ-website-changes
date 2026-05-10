import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { InfraProperty } from './infra-property.entity';

@Entity('infra_property_media')
export class InfraPropertyMedia {
  @PrimaryGeneratedColumn('uuid')
  mediaId: string;

  @Column()
  url: string;

  @Column({ default: 'image' })
  kind: string;

  @Column({ default: 0 })
  sortOrder: number;

  @ManyToOne(() => InfraProperty, (p) => p.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: InfraProperty;
}
