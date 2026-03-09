import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { BrickTypes, RailingMaterials } from '../enum/brickMasonry.enum';
import { CementBrands } from '../../centring/enum/centring.enum';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';

@Entity()
export class BrickMasonry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  typeOfWork: string;

  @Column({
    type: 'enum',
    enum: BrickTypes,
    default: BrickTypes.CLAY,
  })
  brickType: BrickTypes;

  @Column('text')
  brickQuality: string;

  @Column({
    type: 'enum',
    enum: CementBrands,
    default: CementBrands.UltraTech,
  })
  cementBrand: CementBrands;

  @Column('text')
  cementType: string;

  @Column({ default: false })
  plasteringRequired: boolean;

  @Column('simple-array', { nullable: true, default: null })
  plasteringType: string[];

  @Column({ default: false })
  basementRequired: boolean;

  @Column('int', { nullable: true, default: null })
  basementArea?: number;

  @Column('int', { nullable: true, default: null })
  basementHeight?: number;

  @Column({
    type: 'enum',
    enum: RailingMaterials,
    default: RailingMaterials.STAINLESS_STEEL,
  })
  railingMaterial: RailingMaterials;

  @Column('text')
  railingType: string;

  @Column('int')
  totalArea: number;

  @Column('text')
  structureType: string;

  @Column('text')
  elevationDetails: string;

  @Column('text', { nullable: true })
  additionalRequirement: string;

  @OneToOne(() => CBService, (cbservice) => cbservice.brickMasonry, {
    onDelete: 'CASCADE',
  })
  service: CBService;
}
