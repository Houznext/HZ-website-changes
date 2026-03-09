import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import {
  FinishTypes,
  FlooringMaterials,
  InstallationTypes,
} from '../enum/flooring.enum';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';

@Entity()
export class Flooring {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: FlooringMaterials,
    default: FlooringMaterials.Tiles,
  })
  flooringMaterial: FlooringMaterials;

  @Column('int')
  totalArea: number;

  @Column({
    type: 'enum',
    enum: FinishTypes,
    default: FinishTypes.Matte,
  })
  finishType: FinishTypes;

  @Column('int')
  materialThickness: number;

  @Column({
    type: 'enum',
    enum: InstallationTypes,
    default: InstallationTypes.Direct,
  })
  installationType: InstallationTypes;

  @Column({ default: false })
  isSkirtingRequired: boolean;

  @Column({nullable:true})
  additionalRequirement: string;

  @OneToOne(() => CBService, (service) => service.flooring, {
    onDelete: 'CASCADE',
  })
  service: CBService;
}
