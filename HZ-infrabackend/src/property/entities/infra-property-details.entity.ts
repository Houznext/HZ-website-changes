import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { InfraProperty } from './infra-property.entity';

@Entity('infra_property_details')
export class InfraPropertyDetails {
  @PrimaryGeneratedColumn('uuid')
  detailsId: string;

  @Column({ type: 'varchar', nullable: true })
  roadFacingWidth: string | null;

  @Column({ type: 'boolean', nullable: true })
  cornerPlot: boolean | null;

  @Column('text', { nullable: true })
  additionalNotes: string | null;

  @OneToOne(() => InfraProperty, (p) => p.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: InfraProperty;
}
