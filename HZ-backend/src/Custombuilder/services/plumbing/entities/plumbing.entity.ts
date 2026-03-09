import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import {
  FixtureBrands,
  PipeBrands,
  PipeMaterials,
} from '../enum/plumbing.enum';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';

@Entity()
export class Plumbing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  typeOfWork: string;

  @Column({
    type: 'enum',
    enum: PipeMaterials,
    default: PipeMaterials.CPVC,
  })
  pipeMaterial: PipeMaterials;

  @Column({
    type: 'enum',
    enum: PipeBrands,
    default: PipeBrands.Finolex,
  })
  pipeBrand: PipeBrands;

  @Column({
    type: 'enum',
    enum: FixtureBrands,
    default: FixtureBrands.Jaquar,
  })
  fixtureBrand: FixtureBrands;

  @Column('int')
  totalBathrooms: number;

  @Column('int')
  totalKitchens: number;

  @Column('text')
  waterSource: string;

  @Column({ nullable: true })
  indianBathrooms: number | null;

  @Column({ nullable: true })
  westernBathrooms: number | null;

  @Column('int')
  pipeThickness: number;

  @Column('text')
  additionalRequirement: string;

  @Column({ default: false })
  isDrainageRequired: boolean;

  @OneToOne(() => CBService, (service) => service.plumbing, {
    onDelete: 'CASCADE',
  })
  service: CBService;
}
