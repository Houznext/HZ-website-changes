import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import {
  CementBrands,
  CentringMaterials,
  SteelBrands,
} from '../enum/centring.enum';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';

@Entity()
export class Centring {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: CentringMaterials,
    default: CentringMaterials.Wooden,
  })
  centringMaterial: CentringMaterials;

  @Column('int')
  totalArea: number;

  @Column({
    type: 'enum',
    enum: SteelBrands,
    default: SteelBrands.Tata,
  })
  steelBrand: SteelBrands;

  @Column()
  additionalRequirement: string;

  @Column({ default: false })
  isScaffoldingRequired: boolean;

  @Column({
    type: 'enum',
    enum: CementBrands,
    default: CementBrands.UltraTech,
  })
  cementBrand: CementBrands;

  @OneToOne(() => CBService, (cbService) => cbService.centring)
  service: CBService;
}
