import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import {
  CasingOptions,
  CasingType,
  DrillingTechnology,
  PumsetCompany,
} from '../enum/borewell.enum';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';

@Entity()
export class Borewell {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  recommendedDepth: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  borewellDiameter: number;

  @Column()
  hydroSurvey: boolean;

  @Column({
    type: 'enum',
    enum: CasingType,
    default: CasingType.Steel,
  })
  casingType: CasingType;

  @Column({
    type: 'enum',
    enum: DrillingTechnology,
    default: DrillingTechnology.Percussion,
  })
  drillingType: DrillingTechnology;

  @Column({
    type: 'enum',
    enum: CasingOptions,
    default: CasingOptions.Deep,
  })
  casingDepth: CasingOptions;

  @Column({
    type: 'enum',
    enum: PumsetCompany,
    default: PumsetCompany.Kirloskar,
  })
  pumpBrand: PumsetCompany;

  @Column('text', { nullable: true })
  additionalRequirement: string;

  @OneToOne(() => CBService, (CBService) => CBService.borewells, {
    onDelete: 'CASCADE',
  })
  service: CBService;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
