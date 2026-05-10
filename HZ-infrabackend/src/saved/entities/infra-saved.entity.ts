import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { InfraProperty } from '../../property/entities/infra-property.entity';

@Entity('infra_saved_property')
@Unique(['customerId', 'property'])
export class InfraSavedProperty {
  @PrimaryGeneratedColumn('uuid')
  savedId: string;

  @Column()
  customerId: string;

  @ManyToOne(() => InfraProperty, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: InfraProperty;

  @CreateDateColumn()
  createdAt: Date;
}
